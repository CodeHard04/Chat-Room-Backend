const { Client } = require("@elastic/elasticsearch");

class elastic {
  constructor() {
    // this.client = new Client({
    //   node: "http://localhost:9200",
    //   maxRetries: 5,
    //   requestTimeout: 60000,
    //   // sniffOnStart: true
    // });
    this.client = new Client({
      cloud: {
        id: process.env.ELASTIC_CLOUD_ID,
      },
      auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD,
      },
    });
  }
  async initIndex(indexName) {
    await this.client.indices.create({
      index: indexName,
    });
  }
  addDocument(indexName, data) {
    this.client.index({
      index: indexName,
      refresh: true,
      body: {
        name: data.name,
        id: data.id,
      },
    });
  }

  prefixSearch(indexName, username) {
    return new Promise((resolve) => {
      const prefixData = this.client.search({
        index: indexName,
        body: {
          query: {
            prefix: {
              name: username,
            },
          },
        },
        size: 50,
      });
      resolve(prefixData);
    });
  }

  async fuzzySearch(indexName, username) {
    return new Promise((resolve) => {
      const fuzzyData = this.client.search({
        index: indexName,
        body: {
          query: {
            fuzzy: {
              name: {
                value: username,
                fuzziness: "auto",
                max_expansions: 1000,
                // prefix_length: 0,
              },
            },
          },
        },
        size: 50,
      });
      resolve(fuzzyData);
    });
  }
}

module.exports = new elastic();
