import { Pinecone } from '@pinecone-database/pinecone';
import { ENV } from './env';

export const pinecone = new Pinecone({
  apiKey: ENV.PINECONE_API_KEY,
  environment: ENV.PINECONE_ENVIRONMENT,
});

export const createPineconeIndexAndCollection = async () => {
  await pinecone.createCollection({
    name: 'mini_dev_collection',
    source: 'minideveloper',
  });

  await pinecone.createIndex({
    name: 'mini_dev_index',
    dimension: 512,
    metric: 'cosine',
    sourceCollection: 'mini_dev_collection',
  });

  await pinecone.describeIndex('mini_dev_index');
};
