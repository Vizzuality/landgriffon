# Landgriffon Client

Project integrated into the Horizon 2020 EU Research and Innovation Programme. The goal of this grant is to design, develop, and validate tools that facilitate a more sustainable supply chain management. How? By identifying where food supply chain raw materials are produced, and analyze its environmental impacts, anticipate future risks and facilitate a well-informed decision-making process. The tools will be designed, developed and validated through a process of business cases, in which we will ask some companies to participate in the definition and test. The final outcome of the project is an MVP validated by some of the companies that will take part in business cases. This project is initially organised in 6 work packages: WP1 Management; WP2 Market & Business; WP3 Products & Services ; WP4 Customer Business Cases; WP5 User Portal and Service Portal; WP6 Dissemination & Communication.

## Documentation

Visit our [documentation](https://front-end-scaffold-docs.vercel.app/?path=/story/intro--page) live. Alternatively, you can also see our documentation [here](/docs).

### Quick start

Create the file `.env.local`. You can see an example on LastPass.

Install dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

### Environmental variables
The application handles environmental variables using [@t3-oss/env-nextjs](https://env.t3.gg/docs). You can see the available (and required) variables in the `./src/env` file. **NOTE**: the application will NOT start if the required variables are not set previously.

#### Testing
Additionally, and exclusively for testing purposes, you can set the following environmental variables:

- `CYPRESS_USERNAME`: email to authenticate for the e2e tests.
- `CYPRESS_PASSWORD`: password to authenticate for the e2e tests.
- `CYPRESS_API_URL`: API used to run the e2e tests.

### Running tests

Run the tests locally:

```bash
yarn cypress:headless
```

Run the tests in a Dockerfile:

```bash
docker compose -f docker-compose.test.yml build --build-arg NEXT_PUBLIC_API_URL=https://apiUrl
docker compose -f docker-compose.test.yml up --exit-code-from cypress
```
