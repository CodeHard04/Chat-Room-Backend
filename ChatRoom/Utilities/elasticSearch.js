const { Client } = require("@elastic/elasticsearch");

class elastic {
  constructor() {
    this.client = new Client({
      node: "http://localhost:9200",
      maxRetries: 5,
      requestTimeout: 60000,
      // sniffOnStart: true
    });
  }
  async initIndex(indexName) {
    await this.client.indices.create({
      index: indexName,
    });
  }
  addDocument(indexName, username) {
    this.client.index({
      index: indexName,
      refresh: true,
      body: {
        name: username,
      },
    });
  }

  async prefixSearch(indexName, username) {
    this.client
      .search({
        index: indexName,
        body: {
          query: {
            prefix: {
              name: username,
            },
          },
        },
        size: 50,
      })
      .then((res) => {
        console.log("res", res.hits.hits);
        return res.hits.hits;
      });
  }

  async fuzzySearch(indexName, username) {
    this.client
      .search({
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
      })
      .then((res) => {
        console.log("res", res.hits.hits);
        return res.hits.hits;
      });
    // return fuzzyResult.hits.hits;
  }
}

module.exports = new elastic();
