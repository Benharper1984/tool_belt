# General Tools Platform

A comprehensive, modular web platform hosting multiple productivity tools with a focus on scalability, maintainability, and user experience.

## 🚀 Features

### Platform Capabilities
- **Modular Architecture**: Each tool is independently developed and can use its optimal tech stack
- **Consistent Design**: Shared UI components and design system ensure seamless user experience
- **High Performance**: Lazy loading, optimized rendering, and responsive design for all devices
- **Type Safety**: Comprehensive TypeScript interfaces and Zod validation
- **Export/Import**: Multiple format support (CSV, JSON, YAML, TXT)

### Currently Available Tools

#### Cost Comparison Tool
A powerful tool for comparing costs across different scenarios with:
- ✅ **Interactive Data Table**: Inline editing, add/remove rows, sorting and filtering
- ✅ **Bi-directional Code Sync**: Real-time sync between JSON/YAML code and table data
- ✅ **Dynamic Charts**: Pie charts for category breakdown, bar charts for item comparison
- ✅ **Export/Import**: CSV, JSON, PDF export and CSV/Excel import with Papa Parse
- ✅ **Multiple Currencies**: Support for USD, EUR, GBP, JPY, CAD, AUD
- ✅ **Real-time Validation**: Zod schema validation with error handling

## 🛠️ Tech Stack

### Platform Foundation
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for consistency
- **Hosting**: Optimized for Vercel deployment

### Cost Comparison Tool Stack
- **Tables**: @tanstack/react-table for interactive data management
- **Charts**: Recharts for responsive visualizations
- **Forms**: React Hook Form with Zod validation
- **File Processing**: Papa Parse for CSV handling
- **Icons**: Lucide React for consistent iconography

## 📁 Project Structure

```
/src
  /app
    /tools
      /cost-comparison     # Fully implemented cost comparison tool
      /roi-calculator      # Coming soon
      /time-tracker        # Coming soon  
      /task-manager        # Coming soon
      /[tool-id]          # Dynamic routing for future tools
    /components
      /ui                 # Shared UI component library
      /layout            # Navigation, headers, footers
      /cost-comparison   # Tool-specific components
    /lib
      /utils             # Shared utilities
      /types             # Global TypeScript types
      /cost-comparison.ts # Cost tool data models and validation
  /tools-config.ts       # Central tool registry and metadata
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd general_tools
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 📊 Cost Comparison Tool Usage

### Quick Start
1. Navigate to the Cost Comparison Tool from the sidebar
2. Add cost items using the "Add Item" button
3. Edit items directly in the table with inline editing
4. View visualizations in the Charts tab
5. Export your data in multiple formats

### Data Format
The tool accepts cost items with the following structure:

```typescript
interface CostItem {
  id: string;           // Unique identifier
  name: string;         // Item name
  unitCost: number;     // Cost per unit
  quantity: number;     // Number of units
  total: number;        // Calculated total (unitCost × quantity)
  category: string;     // Item category
  notes?: string;       // Optional notes
}
```

### Supported Categories
- Materials
- Labor  
- Equipment
- Services
- Software
- Utilities
- Transportation
- Other

### Export Formats
- **CSV**: Spreadsheet-compatible format
- **JSON**: Structured data format for developers
- **TXT Report**: Human-readable summary report

## 🔧 Adding New Tools

The platform is designed for easy tool addition. To add a new tool:

1. **Create tool component**
   ```typescript
   // src/app/tools/your-tool/page.tsx
   export default function YourTool() {
     return <div>Your tool implementation</div>;
   }
   ```

2. **Register in tools-config.ts**
   ```typescript
   {
     id: 'your-tool',
     name: 'Your Tool Name', 
     description: 'Tool description',
     route: '/tools/your-tool',
     component: lazy(() => import('@/app/tools/your-tool/page')),
     techStack: ['React', 'Your-Library'],
     category: 'productivity',
     icon: YourIcon,
     status: 'active'
   }
   ```

3. **Tool automatically appears** in navigation and homepage

## 🎨 UI Components

The platform includes a comprehensive UI library:

- **Button**: Multiple variants (default, outline, ghost, etc.)
- **Input**: Form inputs with validation styling
- **Card**: Container components with headers and content areas
- **Data Tables**: Advanced table components with sorting and filtering

## 📈 Performance Features

- **Lazy Loading**: Tools load only when accessed
- **Code Splitting**: Optimized bundle sizes
- **Responsive Design**: Mobile-first approach
- **Debounced Updates**: Smooth real-time sync
- **Virtual Scrolling**: Handle large datasets efficiently

## 🔒 Type Safety

- **Zod Validation**: Runtime type checking and validation
- **TypeScript Interfaces**: Compile-time type safety
- **Strict Mode**: Enhanced error detection
- **API Contracts**: Type-safe data exchanges

## 🚧 Coming Soon

### Planned Tools
- **ROI Calculator**: Financial analysis with projection charts
- **Time Tracker**: Productivity tool with time management
- **Task Manager**: Collaborative task organization
- **Invoice Generator**: PDF generation with templates

### Platform Enhancements
- **User Authentication**: Account management with NextAuth.js
- **Data Persistence**: Cloud storage integration
- **Tool Marketplace**: Community-contributed tools
- **Advanced Sharing**: Collaboration features

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use consistent naming conventions
- Write comprehensive tests
- Comment complex business logic
- Maintain 80%+ shared component reuse

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support, email support@generaltools.com or create an issue on GitHub.

---

**General Tools Platform** - Empowering productivity through modular, scalable web tools.