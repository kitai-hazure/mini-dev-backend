import { Injectable, UploadedFiles } from '@nestjs/common';
require('@tensorflow/tfjs');
import {
  createEmbeddings,
  createQueryEmbedding,
} from './helper/data_embedder.helper';
import * as fs from 'fs';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { ENV } from 'src/constants/env';
import { pinecone } from 'src/constants/pinecone';

@Injectable()
export class DataIngestorService {
  chain: any;
  pineconeClient: any;

  constructor() {
    this.pineconeClient = pinecone.index('minideveloper');
    const llm = new OpenAI({
      openAIApiKey: ENV.OPENAI_API_KEY,
      temperature: 0.9,
      modelName: ENV.OPENAI_MODEL_NAME,
      maxTokens: 256,
      topP: 0.2,
    });
    const prompt = new PromptTemplate({
      inputVariables: ['query', 'context'],
      template:
        'Given is the query and the context, output a result for the query and provide the source link given to you in the context: \nQuery: {query} \nContext: \n{context}',
    });
    this.chain = new LLMChain({
      llm: llm,
      prompt: prompt,
    });
  }

  async injectFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    const data = JSON.parse(files[0]['buffer'].toString());
    const pages = data['pages'];

    const embeddedDetails = await createEmbeddings(pages);

    const line_embeddings = embeddedDetails['line_text_embeddings'];
    const line_metadata = embeddedDetails['line_metadata'];
    const line_ids = embeddedDetails['line_ids'];

    const records = [];
    const BATCH_SIZE = 80;

    for (let i = 0; i < line_ids.length; i++) {
      records.push({
        id: line_ids[i],
        values: line_embeddings[i],
        metadata: line_metadata[i],
      });
    }

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await this.pineconeClient.upsert(batch);
    }

    const linkData = JSON.parse(files[1]['buffer'].toString());
    fs.writeFileSync('./src/data_ingestor/data.json', JSON.stringify(data));
    fs.writeFileSync(
      './src/data_ingestor/linkspage.json',
      JSON.stringify(linkData),
    );
    return 'DATA UPLOADED SUCCESSFULLY';
  }

  async query(query) {
    const embed = await createQueryEmbedding(query.query);
    // TODO -> REMOVE THIS IN PROD
    const results = await this.pineconeClient.query({
      topK: 2,
      includeMetadata: true,
      vector: embed[0],
      includeValues: true,
    });

    // TODO: UNCOMMENT THE BELOW PART IF THE RESULTS ARE CONSISTENT
    const data = JSON.parse(
      fs.readFileSync('./src/data_ingestor/data.json').toString(),
    );

    const linksMapper = JSON.parse(
      fs.readFileSync('./src/data_ingestor/linkspage.json').toString(),
    );

    const len = results['matches'].length;
    const pages_to_pass = [];

    const matches = results['matches'];
    for (let i = 0; i < len; i++) {
      const page_number = matches[i]['metadata']['page_num'];
      let page_content = '';
      const page_data = data['pages'][page_number];
      for (const line in page_data['lines']) {
        const line_text = page_data['lines'][line]['text'];
        page_content += line_text;
        page_content += '  ';
      }

      pages_to_pass.push({
        page_number: page_number,
        page_content: page_content,
      });
    }

    let context = '';

    for (const page in pages_to_pass) {
      const page_number = pages_to_pass[page]['page_number'];
      const page_content = pages_to_pass[page]['page_content'];

      context +=
        'Source: \n' +
        // TODO -> RN ONLY SUPERFLUID WE CAN EXTEND IT AS WE INCREASE OUR DATASET
        linksMapper[page_number] +
        '\n' +
        'Content: \n' +
        page_content +
        '\n\n';
    }

    const result = await this.chain.predict({
      query: query.query,
      context: context,
    });

    return result;
  }
}
