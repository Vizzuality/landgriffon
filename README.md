# Land Griffon

[Homepage](https://vizzuality.github.io/landgriffon/)

### API Badges

[![Test Coverage](https://api.codeclimate.com/v1/badges/b46441bdb6b80f3b0094/test_coverage)](https://codeclimate.com/github/Vizzuality/landgriffon/test_coverage)

Making Food Supply Chains more Sustainable

## Project description

Deforestation and water stress have a negative impact on agricultural supply chains, preventing agribusiness and food companies from becoming more sustainable. Advanced technology such as the Copernicus programme provides precise, timely and easily accessible data that improve environmental management and mitigate climate change effects. The EU-funded LAND GRIFFON project will develop digital decision-making instruments based on Copernicus data to observe, prognoses, analyse and follow environmental impacts on the entire agricultural supply chain. These innovative instruments will support agribusiness and food enterprises in becoming more sustainable and transparent.

## Dependencies

## Repository structure

This repository is a monorepo which includes all the microservices of the Land Griffon platform. Each microservice lives in a top-level folder.

Services are packaged as Docker images.

Microservices are set up to be run via Docker Compose for local development.

In CI, testing, staging and production environments, microservices are orchestrated via Kubernetes (forthcoming).


* `/marketing`: The current static site, available at [https://vizzuality.github.io/landgriffon/](https://vizzuality.github.io/landgriffon/).
* `/infrastructure`: Contains the [infrastructure as code](https://en.wikipedia.org/wiki/Infrastructure_as_code) to set up the project on [AWS](https://aws.amazon.com/) using [Terraform](https://www.terraform.io/)
* `/api`: An API will live here at some point. It will include its own README.md for specific information on it.
