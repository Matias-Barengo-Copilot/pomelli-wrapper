---
name: admin-dashboard-builder
description: Build Next.js admin dashboards with CRUD operations, data tables, forms, and charts. Use when building admin panels, SaaS dashboards, internal tools, or business management interfaces. Covers Next.js 14 App Router, shadcn/ui components, SWR data fetching, React Hook Form, Recharts, authentication (Clerk/NextAuth), MongoDB integration. Based on CoPilot proven patterns. Triggers on admin dashboard, admin panel, CRUD interface, data table, internal tool, management dashboard, SaaS admin, business dashboard, Next.js dashboard.
allowed-tools: Read, Write, Edit, Bash(npm *), Bash(git *)
---

# Admin Dashboard Builder

Build production-ready admin dashboards using CoPilot Innovations' proven patterns and modern React best practices.

## When to Use This Skill

Use this skill when you need to scaffold a new admin dashboard or admin panel for:
- SaaS platforms requiring user, subscription, or organization management
- Internal tools for managing business entities (customers, products, reports)
- HR platforms with employee management and analytics
- Business intelligence dashboards with charts and data visualization
- Any CRUD-heavy application requiring role-based access control

## Technology Stack (CoPilot Standard)

Based on analysis of CoPilot's production dashboards, our standard stack is:

**Framework & Core:**
- Next.js 14+ (App Router with Server Components)
- TypeScript 5+
- React 18+
- Tailwind CSS 3+

**UI Components:**
- shadcn/ui (Radix UI primitives) - vendored components, not npm packages
- Lucide React for icons
- next-themes for dark mode support

**Forms & Validation:**
- React Hook Form for performant form state management
- Zod for runtime validation with TypeScript inference
- @hookform/resolvers for RHF + Zod integration

**Data Tables:**
- Custom table components built on shadcn/ui Table primitives
- Client-side filtering, sorting, and pagination
- Search, status filters, and bulk actions

**Data Fetching:**
- SWR for client-side data fetching, caching, and revalidation
- Native Next.js Route Handlers (app/api) for backend APIs
- Axios for HTTP requests

**Charts & Visualization:**
- Recharts for bar charts, line charts, and area charts
- Custom chart components with responsive containers

**Authentication:**
- Clerk for hosted auth (preferred for speed to production)
- NextAuth.js for self-hosted requirements
- Middleware-based route protection

**Database:**
- MongoDB with Mongoose (most common in CoPilot projects)
- Azure Cosmos DB for enterprise clients
- Connection pooling via singleton pattern

**Notifications:**
- Sonner (toast notifications) for user feedback

**Deployment:**
- Vercel (default)
- Self-hosted options available

## Questions to Ask Before Building

### Core Requirements
1. **What entities will this dashboard manage?** (users, subscriptions, products, reports, etc.)
2. **What are the primary user roles?** (admin, manager, viewer, etc.)
3. **What specific actions will each role perform?** (CRUD operations, approvals, exports, etc.)
4. **Will you need multi-tenancy or organization support?** (single tenant, multi-tenant, workspace-based)

### Data & Features
5. **What data sources will you integrate with?** (databases, APIs, third-party services)
6. **Which database are you using?** (MongoDB, PostgreSQL, Cosmos DB, MySQL, etc.)
7. **What key metrics need to be displayed on the main dashboard?** (active users, revenue, conversions, etc.)
8. **Do you need real-time data or is periodic refresh acceptable?** (WebSockets vs polling vs SWR)
9. **What exports are required?** (CSV, PDF, Excel, none)

### Tables & Data Views
10. **What are the most important data tables?** (users table, transactions table, reports table, etc.)
11. **What filtering and search capabilities are needed?** (by status, date range, text search, multi-select)
12. **What actions can be performed on table rows?** (edit, delete, activate/deactivate, bulk operations)

### Authentication & Security
13. **Do you prefer hosted auth (Clerk) or self-hosted (NextAuth)?** (Clerk is faster, NextAuth has more control)
14. **What authentication methods are required?** (email/password, OAuth, SSO, magic links)
15. **Do you need audit logging or activity tracking?** (yes/no, and for which actions)

### Design & UX
16. **Do you have an existing design system or brand colors?** (provide Tailwind config, Figma file, or use defaults)
17. **Should the dashboard support dark mode?** (yes/no)
18. **What level of mobile responsiveness is required?** (desktop-only, tablet-friendly, fully responsive)

## CoPilot Component Patterns

### Pattern 1: Data Table with Filters, Search, and Actions

**File: `components/users/users-table.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface UsersTableProps {
  search?: string;
  onMutate?: () => void;
}

export function UsersTable({ search = "", onMutate }: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const itemsPerPage = 10;

  const buildParams = () => {
    const params = new URLSearchParams();
    params.append("limit", String(itemsPerPage));
    params.append("offset", String((currentPage - 1) * itemsPerPage));
    if (statusFilter.length > 0) params.append("status", statusFilter.join(","));
    if (search) params.append("search", search);
    return params.toString();
  };

  const { data, error, isLoading, mutate } = useSWR<{
    users: User[];
    total: number;
  }>(`/api/users?${buildParams()}`, fetcher);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = data ? Math.ceil(data.total / itemsPerPage) : 0;

  const handleAction = async (userId: string, action: string) => {
    try {
      // Implement action logic
      await mutate();
      onMutate?.();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction(user.id, "edit")}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(user.id, "deactivate")}>
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, data?.total || 0)} of {data?.total || 0} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Form Dialog with Zod Validation

**File: `components/users/add-user-dialog.tsx`**

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "manager", "user"]),
});

type UserFormValues = z.infer<typeof userSchema>;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/users", data);
      toast.success("User created successfully");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to create user");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Create a new user account</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### Pattern 3: Dashboard Layout with Sidebar

**File: `app/(dashboard)/layout.tsx`**

```typescript
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
```

**File: `components/sidebar.tsx`**

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  FileText,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>
      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

### Pattern 4: SWR Data Fetching with Custom Hook

**File: `lib/hooks/use-users.ts`**

```typescript
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  pagination: {
    page: number;
    pageCount: number;
  };
}

export function useUsers(params?: URLSearchParams) {
  const queryString = params ? `?${params.toString()}` : "";
  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    `/api/users${queryString}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    users: data?.users || [],
    total: data?.total || 0,
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}
```

**File: `lib/fetcher.ts`**

```typescript
import axios from "axios";

export const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};
```

### Pattern 5: Protected API Route with Database Connection

**File: `app/api/users/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Database connection
    await connectDB();

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }

    // Execute queries
    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      users,
      total,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        pageCount: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const user = await User.create(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
```

### Pattern 6: MongoDB Connection with Singleton Pattern

**File: `lib/mongodb.ts`**

```typescript
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env");
}

const uri = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

### Pattern 7: Recharts Dashboard Chart

**File: `components/dashboard/revenue-chart.tsx`**

```typescript
"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[350px] w-full bg-muted/20 rounded-md">
        <p className="text-muted-foreground">Loading chart...</p>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Pattern 8: Clerk Authentication Middleware

**File: `middleware.ts`**

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/users(.*)",
  "/settings(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## Architecture Recommendations

### Project Structure

```
admin-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── users/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── dashboard/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── users/
│   │   ├── users-table.tsx
│   │   ├── add-user-dialog.tsx
│   │   └── user-filters.tsx
│   └── dashboard/
│       ├── stats-card.tsx
│       └── revenue-chart.tsx
├── lib/
│   ├── mongodb.ts
│   ├── fetcher.ts
│   ├── utils.ts
│   └── hooks/
│       ├── use-users.ts
│       └── use-dashboard.ts
├── models/
│   ├── User.ts
│   └── Subscription.ts
├── types/
│   └── index.ts
├── middleware.ts
└── package.json
```

### Rendering Strategy

- **Server Components (default)**: Use for static layouts, sidebars, headers, and data-heavy initial loads
- **Client Components**: Use for interactive tables, forms, dialogs, and charts (mark with "use client")
- **API Routes**: All data mutations and database queries happen server-side in Route Handlers
- **SWR**: Client-side data fetching with automatic revalidation and caching

### Performance Best Practices

1. **Pagination over infinite scroll** - Better for keyboard navigation and context preservation
2. **Server-side filtering for large datasets** - Keep query params in sync with API routes
3. **Debounced search inputs** - Wait 300-500ms after typing before triggering searches
4. **Optimistic updates with SWR** - Update UI immediately, revalidate in background
5. **Skeleton loaders** - Show loading states with proper component structure
6. **Image optimization** - Use Next.js `<Image>` component with proper sizing

## Scaffolding Steps

### Step 1: Initialize Next.js Project

```bash
npx create-next-app@latest admin-dashboard --typescript --tailwind --app --no-src-dir
cd admin-dashboard
```

During setup, choose:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Import alias: Yes (@/*)

### Step 2: Install Core Dependencies

```bash
npm install @clerk/nextjs
npm install axios swr
npm install react-hook-form @hookform/resolvers zod
npm install sonner
npm install lucide-react
npm install next-themes
npm install recharts
npm install date-fns
npm install class-variance-authority clsx tailwind-merge
npm install mongodb mongoose
```

### Step 3: Install shadcn/ui and Add Base Components

```bash
npx shadcn@latest init
```

Choose:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Then add the essential components:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add form
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add tooltip
npx shadcn@latest add separator
npx shadcn@latest add card
```

### Step 4: Set Up Environment Variables

Create `.env.local`:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Configure Clerk Authentication

**Install Clerk:**

```bash
npm install @clerk/nextjs
```

**Create `middleware.ts`** (use Pattern 8 above)

**Create `app/sign-in/[[...sign-in]]/page.tsx`:**

```typescript
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

**Create `app/sign-up/[[...sign-up]]/page.tsx`:**

```typescript
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

### Step 6: Set Up Database Connection

**Create `lib/mongodb.ts`** (use Pattern 6 above)

**Create a sample User model in `models/User.ts`:**

```typescript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
```

### Step 7: Create Utility Files

**Create `lib/utils.ts`:**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Create `lib/fetcher.ts`** (use Pattern 4 above)

### Step 8: Build Dashboard Layout

**Create route group structure:**

```bash
mkdir -p app/\(dashboard\)/{dashboard,users,settings}
```

**Create `app/(dashboard)/layout.tsx`** (use Pattern 3 above)

**Create `components/sidebar.tsx`** (use Pattern 3 above)

**Create `components/header.tsx`:**

```typescript
import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
```

### Step 9: Create Dashboard Home Page

**Create `app/(dashboard)/dashboard/page.tsx`:**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Activity, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+5% from last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-muted-foreground">+2% from last week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Step 10: Create Users Management Page

**Create `app/api/users/route.ts`** (use Pattern 5 above)

**Create `app/(dashboard)/users/page.tsx`:**

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UsersTable } from "@/components/users/users-table";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { Search, Plus } from "lucide-react";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <UsersTable key={refreshKey} search={search} onMutate={() => setRefreshKey((k) => k + 1)} />

      <AddUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
```

**Create `components/users/users-table.tsx`** (use Pattern 1 above)

**Create `components/users/add-user-dialog.tsx`** (use Pattern 2 above)

### Step 11: Add Toast Notifications

**Update `app/layout.tsx`:**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### Step 12: Configure TypeScript and Tailwind

**Update `tailwind.config.ts`:**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### Step 13: Run and Test

```bash
npm run dev
```

Visit `http://localhost:3000` and test:
1. Sign up / Sign in flows
2. Dashboard displays correctly
3. Navigate to Users page
4. Add a new user via the dialog
5. Search and filter users
6. Test pagination

## Testing Strategy

### Unit Tests

Use Vitest for unit testing:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**Example test for a component (`__tests__/users-table.test.tsx`):**

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UsersTable } from "@/components/users/users-table";

vi.mock("swr", () => ({
  default: () => ({
    data: {
      users: [
        { id: "1", name: "John Doe", email: "john@example.com", role: "user", status: "active" },
      ],
      total: 1,
    },
    error: null,
    isLoading: false,
    mutate: vi.fn(),
  }),
}));

describe("UsersTable", () => {
  it("renders user data correctly", () => {
    render(<UsersTable search="" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });
});
```

### E2E Tests

Use Playwright for end-to-end testing:

```bash
npm install -D @playwright/test
npx playwright install
```

**Example E2E test (`e2e/users.spec.ts`):**

```typescript
import { test, expect } from "@playwright/test";

test("can add a new user", async ({ page }) => {
  await page.goto("/users");

  await page.click('button:has-text("Add User")');
  await page.fill('input[name="name"]', "Jane Doe");
  await page.fill('input[name="email"]', "jane@example.com");
  await page.selectOption('select[name="role"]', "manager");
  await page.click('button[type="submit"]');

  await expect(page.locator("text=User created successfully")).toBeVisible();
  await expect(page.locator("text=Jane Doe")).toBeVisible();
});
```

### API Tests

Test API routes with Vitest:

```typescript
import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/users/route";

describe("/api/users", () => {
  it("returns users list", async () => {
    const req = new Request("http://localhost:3000/api/users?limit=10&offset=0");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("users");
    expect(data).toHaveProperty("total");
  });
});
```

## Common Pitfalls and Solutions

### Pitfall 1: Missing "use client" Directive

**Problem:** Server Component errors when using hooks or event handlers.

**Solution:** Add "use client" at the top of any component using useState, useEffect, onClick, etc.

### Pitfall 2: Database Connection Exhaustion

**Problem:** Opening new MongoDB connections on every request.

**Solution:** Use the singleton pattern in `lib/mongodb.ts` (Pattern 6).

### Pitfall 3: SWR Caching Issues

**Problem:** Stale data after mutations.

**Solution:** Always call `mutate()` after successful POST/PATCH/DELETE operations.

### Pitfall 4: Unprotected API Routes

**Problem:** API routes accessible without authentication.

**Solution:** Always check `auth()` from Clerk at the top of every API route.

### Pitfall 5: Hydration Errors with Charts

**Problem:** Recharts causing hydration mismatches.

**Solution:** Use the mounted pattern (Pattern 7) to only render charts client-side.

### Pitfall 6: Poor Mobile Experience

**Problem:** Tables and complex layouts break on small screens.

**Solution:** Hide non-essential columns on mobile, use responsive Tailwind classes.

## Additional Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Clerk Authentication](https://clerk.com/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [SWR Documentation](https://swr.vercel.app)
- [Recharts Documentation](https://recharts.org)

## Research Sources

This skill was created by analyzing CoPilot Innovations' production admin dashboards and incorporating 2026 best practices from:

- [7 Best Next.js 16 Admin Dashboards With shadcn/ui (2026)](https://adminlte.io/blog/nextjs-admin-dashboards-shadcn/)
- [How to Build an Admin Dashboard with shadcn/ui and Next.js (2026 Guide)](https://adminlte.io/blog/build-admin-dashboard-shadcn-nextjs/)
- [Next.js SaaS Dashboard Development: Scalability & Best Practices](https://www.ksolves.com/blog/next-js/best-practices-for-saas-dashboards)
- [Building production ready data tables with shadcn/ui](https://shadcncraft.com/blog/building-production-ready-data-tables-with-shadcn-ui)
- [Data Table - shadcn/ui](https://ui.shadcn.com/docs/components/radix/data-table)
- [How to Create Type-Safe Forms in React with React Hook Form and Zod](https://oneuptime.com/blog/post/2026-01-15-type-safe-forms-react-hook-form-zod/view)
- [Stop Fighting Form State: The Ultimate React Hook Form + Zod Guide (2026 Edition)](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1)

---

**Ready to build?** Start with Step 1 and follow the scaffolding steps in order. Each pattern is production-tested and ready to customize for your specific use case.
