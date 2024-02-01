# Orbite - AI Powered Chat Assistant for LMS Systems

This is Orbite! A chat assistant for LMS systems that uses AI to answer questions about course content.

It can understand course content stored in SCORM packages, PowerPoints, Word Documents, PDFs, Subtitles; and use it to answer questions about the course!

## 💭 Motivation & Problem

The goal of this project is to help your learners get quick answers to their questions without having to search through the content themselves.

Imagine a student is trying to remember how to add custom animations to a PowerPoint presentation after looking at your 100 module course on PowerPoint (Sounds scary 😓).

It would take forever trying to find where the answer may be...

With Orbite they can simply ask "How do I add custom animations in Powerpoint?" and find a answer; not only that, they will also get the source and be directed to it!

AI Powered Chat 🤝 Search - all in one integration!

## 🚀 Quick Start

### Video Demonstration [2 minutes]

Watch this 2 minute video for a live demonstration of Orbite

### View Live Demo

Check out a live demo with pre uploaded content at [orbite.app/demo](https://orbite.app/demo)

### Setup

-   Create a new Orbite account (Limited Access Beta - Contact on [email](mailto:ali@moonlite.digital))
-   Install Integration to your LMS and enter the API key
-   Upload course content
-   Sync with Orbite servers
-   Chat with Orbite about your course!

## 📖 Features / Usage

-   Parse/Extract text from SCORM packages from Articulate Storyline and Rise authoring tools
-   Parse/Extract popular content formats (SCORM, Powerpoints, Word, PDFs, Subtitles)
-   Continously integrate with LMS to keep content up to day (Create, Update, Delete)
-   Chat Embed on course pages for easy access across the LMS
-   Admin dashboard to manage content, integration and view analytics
-   Support for Moodle 4.0+ LMS
-   [Roadmap] Topic modeling to view common questions and topics, providing instructors with a way to improve gaps in course content
-   [Roadmap] CLI tool / service for unsupported LMS integrations
-   [Roadmap] Support for more LMS systems (Totara, Brightspace, Blackboard)

## 📚 Tech Stack

<div style="display:flex;flex-direction:column">
    <h3>Application</h3> 
    <div style="display:flex; flex-wrap: wrap; gap:.5em">
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">Typescript</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">React</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">NextJS 13</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">Tailwind CSS</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">Prisma ORM</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">MySQL DB (PlanetScale)</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">Weaviate VectorDB</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">Clerk (Auth)</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">JWT (Session)</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">OpenAI (LLM)</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">Zod (API Validator)</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">Vercel</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">AWS EC2</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">AWS S3</div>
    </div>
    <h3>Moodle 4.0+ Plugin</h3> 
    <div style="display:flex; flex-wrap: wrap; gap:.5em">
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">PHP</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">JS</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">Mustache (Templating)</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">HTML/CSS</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">Bootstrap</div>
    </div>
    <h3>Test Enviorment</h3> 
    <div style="display:flex; flex-wrap: wrap; gap:.5em">
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">Docker</div>
        <div style="background-color: #181818;padding: 5px 10px;border-radius: 3px">ThunderClient (API Test)</div>
    </div>
</div>

## 🤝 Contributing

### ⚠ You will need to setup the following services

-   Hosted MySQL Database
-   Weaviate Vector Database : [weaviate.io](https://weaviate.io/)
-   Clerk Authorization : [clerk.com](https://clerk.com/)
-   Moodle Docker Test Enviorment : [moodlehq/moodle-docker](https://github.com/moodlehq/moodle-docker) (Will need to download files from [moodle.org](https://download.moodle.org/))

### Clone the repo

```bash
git clone https://github.com/alishuaib/orbite@latest
cd orbite
```

### Install dependencies

```bash
npm install
```

### Copy environment variables example and read instructions for setup

```bash
cp .env.example .env
```

### Push schema to database

```bash
npx prisma db push
```

### Start the development server

```bash
npm run dev
```
