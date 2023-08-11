require('@tensorflow/tfjs');
import * as use from '@tensorflow-models/universal-sentence-encoder';

export const createEmbeddings = async (pages) => {
  const page_line_embeddings = [];

  for (const page_num in pages) {
    const meta = {};
    meta['page_num'] = page_num;
    const alines = [];
    for (const line in pages[page_num]['lines']) {
      const line_text = pages[page_num]['lines'][line]['text'];
      alines.push(line_text);
    }
    meta['lines'] = alines;
    page_line_embeddings.push(meta);
  }

  const model = await use.load();
  const line_texts = [];
  const line_metadata = [];
  const line_ids = [];

  for (let i = 0; i < page_line_embeddings.length; i++) {
    const lines = page_line_embeddings[i]['lines'];
    for (let j = 0; j < lines.length; j++) {
      line_texts.push(lines[j]);
      line_metadata.push({
        page_num: page_line_embeddings[i]['page_num'],
        lines: lines,
      });
      line_ids.push(i + '_' + j);
    }
  }
  const embeddings = await model.embed(line_texts);
  const line_embeddings = embeddings.arraySync();

  return {
    line_texts: line_texts,
    line_text_embeddings: line_embeddings,
    line_metadata: line_metadata,
    line_ids: line_ids,
  };
};

export const createQueryEmbedding = async (query) => {
  const model = await use.load();
  const queryArray = [];
  queryArray.push(query);
  const embeddings = await model.embed(queryArray);
  const query_embedding = embeddings.arraySync();

  return query_embedding;
};
