import { Injectable, UploadedFiles } from '@nestjs/common';
require('@tensorflow/tfjs');
import {
  createEmbeddings,
  createQueryEmbedding,
} from './helper/data_embedder.helper';
import { ChromaClient } from 'chromadb';
import * as fs from 'fs';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { ENV } from 'src/constants/env';
@Injectable()
export class DataIngestorService {
  chromaClient: ChromaClient;
  chain: any;

  constructor() {
    this.chromaClient = new ChromaClient();
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
        'Given is the query and the context, output a result for the user query and provide the source link given to you in the context.: \nQuery: {query} \nContext: \n{context}',
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

    const line_texts = embeddedDetails['line_texts'];
    const line_embeddings = embeddedDetails['line_text_embeddings'];
    const line_metadata = embeddedDetails['line_metadata'];
    const line_ids = embeddedDetails['line_ids'];
    const collection = await this.chromaClient.getOrCreateCollection({
      name: 'test_data_2',
    });
    await collection.add({
      ids: line_ids,
      embeddings: line_embeddings,
      metadatas: line_metadata,
      documents: line_texts,
    });

    const linkData = JSON.parse(files[1]['buffer'].toString());
    // store the json file locally else override if already exist
    fs.writeFileSync('./src/data_ingestor/data.json', JSON.stringify(data));
    fs.writeFileSync(
      './src/data_ingestor/linkspage.json',
      JSON.stringify(linkData),
    );
    return 'test_data_2';
  }

  async query(query) {
    const collection = await this.chromaClient.getCollection({
      name: 'test_data_2',
    });
    const embed = await createQueryEmbedding(query.query);
    const results = await collection.query({
      nResults: 3,
      queryEmbeddings: embed,
    });

    const data = JSON.parse(
      fs.readFileSync('./src/data_ingestor/data.json').toString(),
    );

    const linksMapper = JSON.parse(
      fs.readFileSync('./src/data_ingestor/linkspage.json').toString(),
    );

    const metadata = results['metadatas'][0];
    const pages_to_pass = [];

    for (let i = 0; i < metadata.length; i++) {
      const page_number = metadata[i]['page_num'];
      let page_content = '';
      // @ts-ignore
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
      if (parseInt(page) == 2) continue;
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
