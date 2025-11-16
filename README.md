
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=RocketPHP-org_RocketSchema&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=RocketPHP-org_RocketSchema)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=RocketPHP-org_RocketSchema&metric=bugs)](https://sonarcloud.io/summary/new_code?id=RocketPHP-org_RocketSchema)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=RocketPHP-org_RocketSchema&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=RocketPHP-org_RocketSchema)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=RocketPHP-org_RocketSchema&metric=coverage)](https://sonarcloud.io/summary/new_code?id=RocketPHP-org_RocketSchema)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=RocketPHP-org_RocketSchema&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=RocketPHP-org_RocketSchema)

<div align="center">

# 🚀 RocketSchema

### *A Modern Approach to Business Data Modeling*

**Stop reinventing the wheel. Start building on proven foundations.**

[Explore Schemas](https://rocketschema.org) • [View Examples](#-ready-made-examples) • [Contribute](#-contributing) • [Join Community](#-community)

---

</div>

## 💡 What is RocketSchema?

RocketSchema is a **comprehensive library of battle-tested entity schemas** for building modern business applications. Think of it as a collaborative blueprint that helps developers skip the tedious work of designing common data structures and jump straight to building features that matter.

Rather than being a rigid standard, RocketSchema is a **flexible proposal** — a curated collection of well-thought-out schemas that you can adopt, adapt, or use as inspiration for your own projects.

### 🎯 The Vision

We believe that every developer shouldn't have to redesign what "User", "Invoice", "Product", or "Order" means. These concepts are universal, yet every project starts from scratch. RocketSchema changes that.

## ✨ What's Inside?

### 📚 **21 Domain Categories**

<table>
<tr>
<td width="50%">

**Core & Infrastructure**
- 🔑 API Management (7 entities)
- 🛡️ User Management (21 entities)
- 🔐 Access Control (25 entities)
- 👥 Core Entities (People, Organizations)
- 🔧 Support Types (Addresses, Values)
- 📊 Reference Data (Countries, Currencies)
- 🔄 Transverse (Audit, Integrations)

</td>
<td width="50%">

**Business Domains**
- 🛒 E-Commerce
- 💰 Financial
- 📄 Tax & Compliance
- 👔 Human Resources
- 🤝 Customer Management (CRM)
- 🚚 Fleet Management
- 📚 Knowledge Management

**Healthcare**
- 🏥 Patient Management
- ⚕️ Clinical Care
- 💊 Pharmacy
- 🩺 Medical Records

</td>
</tr>
</table>

### 🎁 Ready-Made Examples

Pre-configured bundles combining multiple domains for specific use cases:

| Example | Domains | Perfect For |
|----------|---------|-------------|
| 🚀 **SaaS Starter** | 10 domains | Multi-tenant platforms, subscription services, API platforms |
| 🏢 **ERP Suite** | 13 domains | Manufacturing, distribution, retail operations |
| 🛒 **E-Commerce** | 11 domains | Online stores, marketplaces, B2B commerce |
| ❤️ **Healthcare EHR** | 15 domains | Hospitals, clinics, telehealth platforms |
| 👔 **HR Platform** | 10 domains | HRIS, recruitment, payroll systems |
| 📊 **CRM Solution** | 8 domains | Customer management, marketing automation |
| 🚛 **Fleet Management** | 10 domains | Logistics, delivery services, transportation |
| 📚 **Knowledge Base** | 8 domains | Documentation portals, internal wikis |

## 🌟 Why Choose RocketSchema?

### For Developers

```diff
- ❌ Spending weeks designing basic entities
- ❌ Debating "should it be userId or user_id?"
- ❌ Missing critical fields discovered in production
- ❌ Rebuilding the same structures across projects

+ ✅ Start with 100+ production-ready entities
+ ✅ Follow proven naming conventions
+ ✅ Benefit from community best practices
+ ✅ Focus on your unique business logic
```

### Core Principles

<table>
<tr>
<td width="50%">

**🎨 Domain-Agnostic Design**

No vendor lock-in, no industry-specific terminology. Every schema works across healthcare, finance, e-commerce, or your custom domain.

**🔬 Fully Normalized**

Proper 3NF/BCNF normalization eliminates data redundancy and maintains data integrity across your entire system.

</td>
<td width="50%">

**📖 Extensively Documented**

Every entity includes detailed descriptions, real-world examples, and comprehensive property documentation.

**🔄 Framework-Agnostic**

Pure JSON schemas that work with any tech stack — Node.js, Python, Java, PHP, .NET, or your framework of choice.

</td>
</tr>
</table>

## 🚀 Quick Start

### 1️⃣ Explore the Library

```bash
# Clone the repository
git clone https://github.com/RocketPHP-org/RocketSchema.git
cd RocketSchema

# Install dependencies
npm install

# Start the documentation site
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to browse all schemas interactively.

### 2️⃣ Use in Your Project

Schemas are just JSON files — use them however you like:

```bash
# Copy the schemas you need
cp data/user-management/schemas/User.json my-project/schemas/
cp data/financial/schemas/Invoice.json my-project/schemas/

# Or reference them directly in your codebase
```

### 3️⃣ Adapt to Your Needs

RocketSchema is a **starting point**, not a constraint:

```json
// Start with our User schema
{
  "name": "User",
  "properties": [...]
}

// Add your custom properties
{
  "name": "User",
  "properties": [
    // ... RocketSchema base properties
    {
      "name": "customField",
      "type": "string",
      "description": "Your business-specific field"
    }
  ]
}
```

## 📂 Project Structure

```
RocketSchema/
├── data/                           # 📦 All schema definitions
│   ├── api-management/             #    API keys, rate limiting
│   ├── user-management/            #    Users, auth, sessions
│   ├── access-control/             #    RBAC, ABAC, permissions
│   ├── financial/                  #    Invoices, payments
│   ├── e-commerce/                 #    Products, orders, carts
│   ├── healthcare-*/               #    Medical domains
│   └── .../                        #    20+ other domains
├── src/                            # 🎨 Documentation website
│   ├── app/                        #    Next.js pages
│   ├── components/                 #    React components
│   └── lib/                        #    Utilities
└── scripts/                        # 🔧 Automation tools
```

## 🤝 Contributing

We'd love your help making RocketSchema even better! Whether you're fixing a typo or adding an entire domain, every contribution matters.

### Ways to Contribute

<table>
<tr>
<td width="33%">

**🐛 Found an Issue?**

- Open a [GitHub issue](https://github.com/RocketPHP-org/RocketSchema/issues)
- Describe the problem clearly
- Suggest improvements

</td>
<td width="33%">

**💡 Have an Idea?**

- Propose new entities
- Suggest new domains
- Share use cases
- Discuss best practices

</td>
<td width="33%">

**🔧 Ready to Code?**

- Fork the repository
- Create a feature branch
- Submit a pull request
- See [CONTRIBUTING.md](./CONTRIBUTING.md)

</td>
</tr>
</table>

### Quality Guidelines

We maintain high standards to ensure schemas are useful across industries:

✅ **Full normalization** (3NF minimum)
✅ **Domain-agnostic naming** (no vendor-specific terms)
✅ **Comprehensive documentation** (800-1200 char descriptions)
✅ **Real-world examples** (at least 2 per entity)
✅ **Consistent structure** (follow RocketSchema conventions)

Our automated review tools help ensure every contribution meets these standards.

## 🛠️ Built With Modern Tools

- **Next.js 14** — React framework for the docs site
- **TypeScript** — Type safety throughout
- **Tailwind CSS** — Beautiful, responsive UI
- **JSON** — Simple, portable schema format

## 🌍 Real-World Impact

<div align="center">

### "RocketSchema saved us 3 months of data modeling work"
*— Coming soon from early adopters*

</div>

## 📊 By the Numbers

- **100+** production-ready entities
- **21** domain categories
- **8** pre-configured examples
- **1000s** of hours of design work captured
- **0** vendor lock-in

## 🎓 Learn More

- 📚 [Full Documentation](https://rocketschema.org)
- 🎯 [Design Principles](./docs/principles.md)
- 🏗️ [Architecture Guide](./docs/architecture.md)
- 📝 [Contributing Guide](./CONTRIBUTING.md)

## 💬 Community

- 🐙 [GitHub Discussions](https://github.com/RocketPHP-org/RocketSchema/discussions)
- 🐛 [Issue Tracker](https://github.com/RocketPHP-org/RocketSchema/issues)
- 💬 [Discord Community](#) *(coming soon)*
- 🐦 [Twitter Updates](#) *(coming soon)*

## 📜 License

**MIT License** — Use freely in commercial and open-source projects.

See [LICENSE](./LICENSE) for details.

---

<div align="center">

### 🚀 Ready to Accelerate Your Development?

**[Explore RocketSchema Now](https://rocketschema.org)** • **[Star on GitHub](https://github.com/RocketPHP-org/RocketSchema)** • **[Join the Community](#)**

Made with ❤️ by developers, for developers

</div>
