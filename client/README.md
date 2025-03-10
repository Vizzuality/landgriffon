# Landgriffon Client <!-- omit from toc -->

- [1. Documentation](#1-documentation)
	- [1.1. Quick start](#11-quick-start)
	- [1.2. Environmental variables](#12-environmental-variables)
		- [1.2.1. Testing environment variables](#121-testing-environment-variables)
	- [1.3. Running tests](#13-running-tests)

---

Project integrated into the [Horizon 2020 EU Research and Innovation Programme](https://research-and-innovation.ec.europa.eu/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-2020_en).

The goal of this grant is to design, develop, and validate tools that facilitate a more sustainable supply chain management.

How? By identifying where food supply chain raw materials are produced, and analyze its environmental impacts,
anticipate future risks and facilitate a well-informed decision-making process.

The tools will be designed, developed and validated through a process of business cases, in which we will ask some
companies to participate in the definition and test.

The final outcome of the project is an MVP validated by some of the companies that will take part in business cases.
This project is initially organised in 6 work packages:

1. Management
2. Market & Business
3. Products & Services
4. Customer Business Cases
5. User Portal and Service Portal
6. Dissemination & Communication

## 1. Documentation

Visit our [documentation](https://front-end-scaffold-docs.vercel.app/?path=/story/intro--page) live. Alternatively, you
can also see our documentation [here](/docs) (TODO: this folder does not exist).

### 1.1. Quick start

Create the file `.env.local`. You can see an example on [LastPass](https://www.lastpass.com/) (TODO: Where in LastPass?).

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

### 1.2. Environmental variables

The application handles environmental variables using [@t3-oss/env-nextjs](https://env.t3.gg/docs). You can see the
available (and required) variables in the `./src/env` (TODO: this file does not exist. Maybe [`env.mjs`](./src/env.mjs))
file. **NOTE**: the application will NOT start if the required variables are not set previously.

#### 1.2.1. Testing environment variables

Additionally, and exclusively for testing purposes, you can set the following environmental variables in the
`cypress.env.json` (TODO: this file does not exist. Does this file need to be created with this keys filled in? Not
clear reading this) file:

```json
{
  "USERNAME": "", // email to authenticate for the e2e tests.
  "PASSWORD": "", // password to authenticate for the e2e tests.
  "API_URL": "" // API used to run the e2e tests.
}
```

### 1.3. Running tests

Run the tests locally:

```bash
pnpm cypress:headless
```

Run the tests in a Dockerfile:

```bash
docker compose -f docker-compose.test.yml build --build-arg NEXT_PUBLIC_API_URL=https://apiUrl
docker compose -f docker-compose.test.yml up --exit-code-from cypress
```

---

[**↩️ GO TO ROOT DOC**](../README.md)
