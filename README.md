# Form Filling Extension

This is a browser extension that allows you to fill forms easily using LLMs with custom prompts for each form type you want to fill.

## How it works

The extension enables you to create custom prompts for different types of forms and then automatically fill them using AI. For example, if you're filling a signup form, you can create a prompt containing your name, email, age, and other details commonly requested for signup forms, and the extension will automatically fill the form fields for you. all the data is stored locally and you are required to use your own API keys.

## Features

- **Custom Prompts**: Create specific prompts for different form types (signup, contact, survey, etc.)
- **AI-Powered**: Uses LLMs to intelligently fill form fields based on your prompts
- **Multiple Form Types**: Support for various form types with different prompt configurations
- **Easy Form Selection**: Simple interface to select forms and apply the appropriate prompts

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

This project is built with plasmo - a web extension platform, for more information about the structure of the project and how to its built go to the [plasmo docs](https://docs.plasmo.com/)
