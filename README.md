# RocketSchema

**A schema standard for ERP systems**

RocketSchema is to ERPs what Schema.org is to the semantic web: a standardized and reusable vocabulary for structuring business data.

## Overview

RocketSchema provides a collection of schemas (types, properties, and relationships) that allow you to capitalize on proven designs for common business entities in ERPs:

- **Person**: individuals, employees, contacts
- **Organization**: companies, subsidiaries, partners
- **Product**: items, services, references
- **Invoice**: invoices, credit notes, quotes
- **Order**: orders, purchase orders
- And many more...

## Why RocketSchema?

### The Problem

Every ERP reinvents the wheel by creating its own data structures for universal concepts. This leads to:

- **Duplication of effort**: repeated design of the same entities
- **Incompatibility**: difficulty integrating between systems
- **Loss of knowledge**: best practices not shared
- **Development time**: slow start for new projects

### The Solution

RocketSchema offers a **common repository** that:

✅ Standardizes business data structures
✅ Facilitates interoperability between ERPs
✅ Accelerates development of new applications
✅ Capitalizes on industry best practices

## Tech Stack

This project is built with:

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **JSON** - Data source (no database)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   └── types/        # TypeScript type definitions
├── data/
│   └── schemas/      # JSON schema definitions
└── public/           # Static assets
```

## Contributing

Contributions are welcome! This project aims to become a community standard.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch strategy and contribution guidelines.

## License

MIT - Free to use for all commercial and open source projects

---

**RocketSchema** - Accelerate your ERP development with shared standards 🚀
