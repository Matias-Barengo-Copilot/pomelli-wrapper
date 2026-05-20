---
name: rag-chatbot-builder
description: Build RAG chatbot projects with LLM integration, vector databases, and retrieval systems. Use when building chatbots, conversational AI, knowledge base search, document Q&A, customer support bots, or AI assistants. Covers vector DBs (Pinecone, Chroma, Weaviate), embeddings, prompt engineering, conversation memory, retrieval optimization. Asks discovery questions and provides architecture recommendations based on CoPilot patterns. Triggers on RAG, chatbot, conversational AI, vector database, embeddings, LLM integration, retrieval augmented generation, knowledge base chatbot, AI assistant, document chat.
allowed-tools: Read, Write, Edit, Bash(npm *), Bash(pip *), Bash(git *)
---

# RAG Chatbot Project Builder

Guides you through building a production-ready RAG chatbot by asking targeted questions and recommending architecture based on CoPilot Innovations' proven patterns from real client projects.

## Process

### 1. Understanding Your Use Case

Ask the user these questions one at a time to gather requirements:

1. **Domain & Purpose**: What domain is this chatbot for? (e.g., e-commerce product assistant, customer support, internal knowledge base, technical documentation, FAQ assistant)

2. **Data Sources**: What data will the chatbot retrieve from?
   - PDF documents (product catalogs, technical specs, manuals)
   - CSV files (product data, inventory)
   - Website content (FAQs, documentation)
   - Knowledge bases (Notion, Confluence)
   - Email integration needs (escalation to support team)
   - Real-time data (APIs, databases)

3. **User Interaction Model**: How will users interact with the chatbot?
   - Embedded website widget
   - Standalone web application
   - API integration (Voiceflow, third-party platforms)
   - Voice interface
   - Multi-channel (web + mobile + voice)

4. **Conversation Complexity**: What type of conversations do you expect?
   - Simple FAQ retrieval (single-turn Q&A)
   - Multi-turn conversations with context retention
   - Product search and recommendations with filters
   - Complex workflows (order tracking, returns, customization)
   - Guided decision trees

5. **Scale Requirements**: What are your expected usage levels?
   - Number of concurrent users (< 10, 10-100, 100-1000, > 1000)
   - Number of documents/data records (< 100, 100-10K, 10K-100K, > 100K)
   - Query response time requirements (< 500ms, < 2s, < 5s)
   - Expected queries per day

6. **Data Update Frequency**: How often does your data change?
   - Static (rarely changes)
   - Weekly/monthly updates
   - Daily updates
   - Real-time updates (webhooks, live inventory)

7. **Tone & Brand Personality**: What conversational style should the chatbot have?
   - Professional and formal
   - Friendly and conversational
   - Technical and precise
   - Sales-oriented and persuasive
   - Specific brand voice guidelines

8. **Memory & Personalization**: What level of conversation memory is needed?
   - No memory (stateless Q&A)
   - Session-level memory (within one conversation)
   - User-level memory across sessions
   - User preferences and history tracking

9. **Guardrails & Safety**: What content restrictions or safety measures are needed?
   - Topic boundaries (only answer about specific domains)
   - PII handling requirements
   - Toxicity filtering
   - Hallucination prevention strategies
   - Regulatory compliance (GDPR, HIPAA, SOC 2)

10. **Integration Requirements**: What external systems need integration?
    - E-commerce platforms (Shopify, WooCommerce)
    - CRM systems (Salesforce, HubSpot)
    - Email services (Gmail API, SendGrid)
    - Payment processing (checkout creation)
    - Analytics and tracking
    - Order management systems

11. **Evaluation & Quality**: How will you measure chatbot success?
    - Answer accuracy and relevance
    - User satisfaction ratings
    - Conversation completion rates
    - Escalation to human support rates
    - Response time metrics
    - Cost per conversation

12. **Budget Considerations**: What are your cost constraints?
    - Free tier / proof of concept
    - Startup budget (< $500/month)
    - Growth stage ($500-$2000/month)
    - Enterprise (> $2000/month)
    - Self-hosted vs. managed services preference

13. **Technical Team Experience**: What is your team's technical background?
    - Primarily frontend developers (prefer TypeScript/JavaScript)
    - Python-focused data/ML engineers
    - Full-stack with infrastructure experience
    - Non-technical team (need low-code solution)

14. **Deployment Environment**: Where will the chatbot be deployed?
    - Cloud providers (AWS, GCP, Azure)
    - Serverless (Vercel, Netlify)
    - Container-based (Docker, Kubernetes)
    - Traditional servers
    - Hybrid approach

15. **Timeline & MVP Scope**: What's your timeline and initial scope?
    - Quick prototype (1-2 weeks)
    - Production MVP (1-2 months)
    - Full-featured system (3+ months)
    - Core features for MVP vs. future enhancements

### 2. Architecture Recommendations

Based on answers, recommend the following architecture components:

#### Vector Database Selection

**Use Pinecone if:**
- Production system with > 100K documents or > 100 concurrent users
- Need guaranteed sub-50ms query latency at scale
- Budget allows for managed service ($70-$500+/month)
- Want minimal operational overhead and automatic scaling
- Team lacks infrastructure expertise
- **CoPilot Pattern**: Used in allpoints-chatbot-2025 for technical documentation retrieval with 10K+ product specs

**Use Chroma if:**
- Prototype or MVP stage
- < 10K documents
- Development/testing environment
- Team is Python-focused
- Budget-conscious (free, self-hosted)
- Quick iteration needed
- **CoPilot Pattern**: Ideal for initial development before scaling to Pinecone

**Use Weaviate if:**
- Need hybrid search (combining vector similarity + keyword matching + metadata filters)
- Multi-modal data (text + images + structured data)
- On-premise deployment required for compliance
- Complex filtering requirements
- **CoPilot Pattern**: Best when product catalogs have rich metadata (price ranges, materials, categories)

#### LLM Provider Selection

**Use OpenAI (GPT-4o, GPT-4o-mini) if:**
- Need best-in-class general knowledge and reasoning
- Want OpenAI Assistants API with built-in file search and code interpreter
- Budget allows ($0.15-$2.50 per 1M tokens)
- Shopify or e-commerce integration (proven ecosystem)
- **CoPilot Pattern**: Used in marks-jewelers-chatbot (TypeScript/Next.js) and nova-chatbot (Python/Flask) for product discovery and customer support

**Use Anthropic Claude if:**
- Need strong instruction following and safety features
- Long context windows (100K+ tokens for large documents)
- Prefer more concise, nuanced responses
- Technical documentation or complex reasoning tasks
- **CoPilot Pattern**: Excellent for enterprise documentation chatbots

**Use OpenAI Assistants API (with threads) if:**
- Want managed conversation memory
- Need built-in file search (vector store management)
- Prefer stateful conversations without manual session handling
- **CoPilot Pattern**: nova-chatbot uses Assistants API for automatic conversation threading and file search

#### Tech Stack Recommendations

**FastAPI + Python + React/Vue Frontend if:**
- Team is Python-focused
- Need ML/data processing pipelines
- Want strong typing with Pydantic
- Integration with pandas, scikit-learn, or other Python libraries
- **CoPilot Pattern**: allpoints-chatbot-2025 uses FastAPI + LangChain + Pinecone for PDF technical docs retrieval

**Next.js + TypeScript (Full-Stack) if:**
- Team is JavaScript/TypeScript-focused
- Want serverless deployment (Vercel)
- Need SSR/SSG for SEO
- Modern React ecosystem
- Rapid prototyping with API routes
- **CoPilot Pattern**: marks-jewelers-chatbot uses Next.js 15 + OpenAI Responses API + Shopify integration

**Flask + Python (Backend Only) if:**
- Simpler requirements than FastAPI
- Legacy Python team
- Quick API prototypes
- Minimal dependencies
- **CoPilot Pattern**: nova-chatbot uses Flask for lightweight API with OpenAI Assistants

**LangChain if:**
- Need pre-built RAG components (document loaders, text splitters, retrievers)
- Want framework for complex chains and agents
- Python-based team
- Rapid prototyping
- **CoPilot Pattern**: allpoints-chatbot-2025 uses LangChain for document processing, embeddings, and retrieval chains

#### Embedding Model Selection

**Use OpenAI text-embedding-3-small (1536 dimensions) if:**
- Cost-effective ($0.02 per 1M tokens)
- Standard accuracy needs
- Integrating with OpenAI LLM
- **CoPilot Pattern**: Default for all three CoPilot projects (nova, marks-jewelers, allpoints)

**Use OpenAI text-embedding-3-large (3072 dimensions) if:**
- Need highest accuracy
- Larger context understanding
- Budget allows ($0.13 per 1M tokens)

**Use sentence-transformers (open-source) if:**
- Self-hosted requirements
- Zero API cost preference
- Lower latency needs
- Data privacy concerns

#### Conversation Memory Patterns

**Session-Level In-Memory (Development) if:**
- Simple prototype
- Single-server deployment
- No persistence needed
- **CoPilot Pattern**: nova-chatbot development mode

**Database-Backed Sessions (Production) if:**
- Multi-server deployment
- User history tracking
- Serverless functions
- **CoPilot Pattern**: marks-jewelers-chatbot uses Neon PostgreSQL for Voiceflow session persistence

**OpenAI Assistants Threads if:**
- Using OpenAI Assistants API
- Want managed conversation state
- Automatic context retention
- **CoPilot Pattern**: nova-chatbot leverages threads for multi-turn conversations

**Query Reformulation Pattern (Recommended):**
- Reformulate user queries using conversation history before retrieval
- Prevents context loss in follow-up questions
- **CoPilot Pattern**: Essential for multi-turn product search conversations

### 3. Common Patterns from CoPilot Projects

#### Pattern 1: Dual Assistant Architecture (FAQ + Products)

**Used in**: nova-chatbot

**When to use**: When you have distinct data sources requiring different retrieval strategies (structured product data vs. unstructured FAQs)

**Implementation**:
```python
# Create separate assistants for different domains
products_assistant = client.beta.assistants.create(
    name="Product Discovery",
    instructions=product_prompt,
    tools=[{"type": "code_interpreter"}],  # For CSV analysis
    model="gpt-4o",
    file_ids=[products_csv_id]
)

faq_assistant = client.beta.assistants.create(
    name="FAQ Support",
    instructions=faq_prompt,
    tools=[{"type": "file_search"}],  # For document retrieval
    model="gpt-3.5-turbo",
    file_ids=[faq_json_id]
)

# Route based on intent
if user_intent == "product_search":
    response = execute_chat(products_assistant, thread_id, message)
else:
    response = execute_chat(faq_assistant, thread_id, message)
```

**Benefits**: Optimized tools per domain, cost-effective model selection, clear separation of concerns

#### Pattern 2: Topical Guardrails with Async Validation

**Used in**: nova-chatbot

**When to use**: When chatbot should only answer domain-specific questions (product-related, company FAQs) and reject off-topic queries

**Implementation**:
```python
async def topical_guardrail(client, user_input):
    messages = [
        {
            "role": "system",
            "content": """Assess if user input is allowed.
            Allowed: products, greetings, purchase questions, help requests.
            Not allowed: politics, unrelated topics.
            Respond 'allowed' or 'not_allowed'."""
        },
        {"role": "user", "content": user_input}
    ]
    response = client.chat.completions.create(
        model='gpt-4o',
        messages=messages,
        temperature=0
    )
    return response.choices[0].message.content

# Run guardrail and chat concurrently
async def execute_chat_with_guardrail(client, assistant, thread_id, user_input):
    guardrail_task = asyncio.create_task(topical_guardrail(client, user_input))
    chat_task = asyncio.create_task(generate_response(client, assistant, thread_id, user_input))

    done, _ = await asyncio.wait(
        [guardrail_task, chat_task],
        return_when=asyncio.FIRST_COMPLETED
    )

    if guardrail_task in done:
        if guardrail_task.result() == "not_allowed":
            chat_task.cancel()
            return "I can only help with our products. What else can I assist with?"

    return await chat_task
```

**Benefits**: Prevents off-topic conversations, reduces API costs on rejected queries, improves user experience

#### Pattern 3: Webhook-Driven Vector Store Updates

**Used in**: nova-chatbot, marks-jewelers-chatbot

**When to use**: When data sources change frequently (e-commerce products, inventory updates)

**Implementation**:
```python
# Flask webhook endpoints for Shopify
@app.route("/product_created", methods=['POST'])
def product_creation():
    data = request.get_json()
    add_new_product(data, 'products_data.csv')
    update_assistant_file(client, assistant.id)  # Re-upload to OpenAI
    return jsonify({'data': data})

@app.route("/product_updated", methods=["POST"])
def product_update():
    data = request.get_json()
    update_product(data, 'products_data.csv')
    update_assistant_file(client, assistant.id)
    return jsonify({'data': data})

@app.route("/product_deleted", methods=['POST'])
def product_deletion():
    data = request.get_json()
    delete_product(data, 'products_data.csv')
    update_assistant_file(client, assistant.id)
    return jsonify({'data': data})
```

**Benefits**: Real-time data synchronization, no manual updates, always current information

#### Pattern 4: LangChain Document Processing Pipeline

**Used in**: allpoints-chatbot-2025

**When to use**: Processing large PDF catalogs with complex structure (tables, images, specifications)

**Implementation**:
```python
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

class PdfService:
    async def pdf_embeddings(self):
        # Load PDFs
        loader = PyPDFDirectoryLoader("app/pdfs")
        documents = loader.load()

        # Split with overlap for context retention
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = text_splitter.split_documents(documents)

        # Add metadata (page numbers, source files)
        for i, chunk in enumerate(chunks):
            chunk.metadata["chunk_id"] = i
            chunk.metadata["source_file"] = chunk.metadata.get("source", "unknown")

        # Embed and store in Pinecone
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        vectorstore = PineconeVectorStore.from_documents(
            chunks,
            embeddings,
            index_name=settings.INDEX_NAME
        )

    async def retrieve_answers(self, query):
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        vectorstore = PineconeVectorStore(
            index_name=settings.INDEX_NAME,
            embedding=embeddings
        )

        # Retrieve with metadata
        retriever = vectorstore.as_retriever(
            search_kwargs={"k": 5}  # Top 5 chunks
        )
        docs = retriever.get_relevant_documents(query)

        # Build context with sources
        context = "\n\n".join([doc.page_content for doc in docs])
        sources = [doc.metadata for doc in docs]

        # Generate answer with context
        llm = ChatOpenAI(model="gpt-4o", temperature=0)
        prompt = f"""Answer based on context:

        Context: {context}

        Question: {query}

        Provide a detailed answer citing page numbers."""

        response = llm.predict(prompt)

        return {
            "answer": response,
            "source_metadata": sources
        }
```

**Benefits**: Handles complex PDFs, preserves metadata, cites sources with page numbers

#### Pattern 5: Persistent Session Context with Database

**Used in**: marks-jewelers-chatbot (Voiceflow integration)

**When to use**: Serverless deployments, multi-channel integrations, need for session persistence

**Implementation**:
```typescript
// Neon PostgreSQL session storage
import { neon } from "@neondatabase/serverless";

interface SessionData {
  session_id: string;
  context: {
    user_name?: string;
    shown_product_ids: string[];
    shown_product_types: string[];
    budget_min?: number;
    budget_max?: number;
  };
  conversation_history: { role: string; content: string }[];
  updated_at: Date;
}

async function getSessionFromDB(sessionId: string): Promise<SessionData> {
  const sql = neon(process.env.DATABASE_URL);
  const result = await sql`
    SELECT context, conversation_history
    FROM voiceflow_sessions
    WHERE session_id = ${sessionId}
  `;

  if (result.length > 0) {
    return {
      session_id: sessionId,
      context: result[0].context,
      conversation_history: result[0].conversation_history,
      updated_at: result[0].updated_at
    };
  }

  return { session_id: sessionId, context: DEFAULT_CONTEXT, conversation_history: [] };
}

async function saveSessionToDB(sessionId: string, context: any, history: any[]): Promise<void> {
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    INSERT INTO voiceflow_sessions (session_id, context, conversation_history, updated_at)
    VALUES (${sessionId}, ${JSON.stringify(context)}::jsonb, ${JSON.stringify(history)}::jsonb, NOW())
    ON CONFLICT (session_id)
    DO UPDATE SET
      context = ${JSON.stringify(context)}::jsonb,
      conversation_history = ${JSON.stringify(history)}::jsonb,
      updated_at = NOW()
  `;
}
```

**Benefits**: Works with serverless, persists across restarts, enables user history tracking

#### Pattern 6: Duplicate Product Filtering in Search Results

**Used in**: marks-jewelers-chatbot

**When to use**: E-commerce chatbots showing product recommendations across multiple searches

**Implementation**:
```typescript
// Track shown products across conversation
const shownProductIds = new Set<string>();
const shownProductNames = new Set<string>();

function extractKeyWords(productName: string): string[] {
  // Remove generic words (gold, silver, necklace)
  const GENERIC_WORDS = new Set(['gold', 'silver', 'diamond', 'necklace', 'ring']);
  return productName.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !GENERIC_WORDS.has(w))
    .slice(0, 5);
}

function isDuplicate(product: Product): boolean {
  // Check by ID
  if (shownProductIds.has(product.id)) return true;

  // Check by similar name (fuzzy matching)
  const keyWords = extractKeyWords(product.name);
  for (const shownName of shownProductNames) {
    const shownKeyWords = extractKeyWords(shownName);
    const overlap = keyWords.filter(w => shownKeyWords.includes(w)).length;
    if (overlap >= 3) return true;  // 3+ matching key words = duplicate
  }

  return false;
}

function filterProducts(products: Product[]): Product[] {
  const filtered = products.filter(p => !isDuplicate(p));

  // Update tracking
  filtered.forEach(p => {
    shownProductIds.add(p.id);
    shownProductNames.add(p.name);
  });

  return filtered;
}
```

**Benefits**: Better user experience, shows variety, prevents repetitive recommendations

#### Pattern 7: Email Escalation with Gmail API

**Used in**: nova-chatbot

**When to use**: Customer support chatbots needing human escalation

**Implementation**:
```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

@app.route('/customer_support', methods=['POST'])
def gmail_send_message():
    data = request.get_json()
    thread_id = data['thread_id']
    email = data['email']

    # Get conversation transcript
    transcript = retrieve_thread_messages(thread_id, client)

    # Build Gmail message
    creds = get_gmail_credentials()
    service = build("gmail", "v1", credentials=creds)

    message = MIMEMultipart("alternative")
    message_content = f"""
    Dear Support Team,

    A customer ({email}) has requested further assistance after their chat session.

    Chat Transcript:
    {transcript}

    Please reach out to them at {email}.
    """

    message.attach(MIMEText(message_content, "html"))
    message["To"] = "support@company.com"
    message["From"] = "bot@company.com"
    message["Subject"] = f"Chat Escalation for {email}"

    encoded = base64.urlsafe_b64encode(message.as_bytes()).decode()
    send_message = service.users().messages().send(
        userId="me",
        body={"raw": encoded}
    ).execute()

    return jsonify({"message": "Escalation sent"}), 200
```

**Benefits**: Seamless handoff to humans, preserves context, tracks escalations

#### Pattern 8: Shopify MCP Integration for E-commerce

**Used in**: marks-jewelers-chatbot

**When to use**: E-commerce chatbots needing product search, variant selection, and checkout creation

**Implementation**:
```typescript
// MCP server exposes Shopify tools
const tools = [
  {
    name: "search_shop_catalog",
    description: "Search products by keywords, price, material, type",
    parameters: {
      query: "string",
      price_min: "number",
      price_max: "number",
      material: "string",
      product_type: "string"
    }
  },
  {
    name: "get_product_variants",
    description: "Get available variants for a product (sizes, colors)",
    parameters: { product_id: "string" }
  },
  {
    name: "create_checkout",
    description: "Create secure checkout for selected products",
    parameters: {
      product_ids: "string[]",
      variant_ids: "string[]"
    }
  },
  {
    name: "track_order",
    description: "Track order by number and email",
    parameters: {
      order_number: "string",
      email: "string"
    }
  }
];

// OpenAI Responses API calls tools automatically
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: conversation_history,
  tools: tools
});

// Handle tool calls
if (response.choices[0].message.tool_calls) {
  for (const toolCall of response.choices[0].message.tool_calls) {
    if (toolCall.function.name === "search_shop_catalog") {
      const results = await shopifySearch(JSON.parse(toolCall.function.arguments));
      // Return results to LLM for formatting
    }
  }
}
```

**Benefits**: Natural language product search, guided shopping, checkout creation

### 4. Project Scaffolding

After recommendations approved, follow these steps:

#### Step 1: Create Directory Structure

**For Python (FastAPI/Flask) projects:**
```
my-rag-chatbot/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI/Flask app
│   ├── core/
│   │   ├── config.py        # Environment variables
│   │   └── prompts.py       # System prompts
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── routes/
│   │   ├── chat.py          # Chat endpoints
│   │   └── admin.py         # Admin endpoints
│   ├── services/
│   │   ├── embeddings.py    # Document processing
│   │   ├── retrieval.py     # Vector search
│   │   └── llm.py           # LLM interactions
│   └── utils/
│       ├── document_loader.py
│       └── text_splitter.py
├── data/
│   ├── raw/                 # Original documents
│   └── processed/           # Chunked documents
├── tests/
│   ├── test_retrieval.py
│   └── test_chat.py
├── scripts/
│   ├── ingest_data.py       # Data ingestion script
│   └── evaluate.py          # Evaluation script
├── .env.example
├── requirements.txt
├── Dockerfile
└── README.md
```

**For TypeScript (Next.js) projects:**
```
my-rag-chatbot/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts     # Chat API endpoint
│   │   ├── ingest/
│   │   │   └── route.ts     # Data ingestion
│   │   └── webhooks/
│   │       └── route.ts     # External webhooks
│   ├── page.tsx             # Chat UI
│   └── layout.tsx
├── components/
│   ├── chat-interface.tsx
│   ├── message-list.tsx
│   └── input-form.tsx
├── lib/
│   ├── assistant.ts         # LLM logic
│   ├── embeddings.ts        # Vector operations
│   ├── retrieval.ts         # Search logic
│   ├── db.ts                # Database client
│   └── prompts.ts           # System prompts
├── types/
│   ├── chat.ts
│   └── product.ts
├── public/
├── .env.local.example
├── package.json
├── tsconfig.json
└── README.md
```

#### Step 2: Set Up Environment Variables

Create `.env` file:
```bash
# LLM Provider
OPENAI_API_KEY=sk-...
# Or for Claude
ANTHROPIC_API_KEY=sk-ant-...

# Vector Database
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=my-chatbot-index
# Or for Weaviate
WEAVIATE_URL=...
WEAVIATE_API_KEY=...

# Database (if using persistent sessions)
DATABASE_URL=postgresql://...

# Optional: Email Integration
GMAIL_CREDENTIALS_JSON=...
GMAIL_TOKEN_JSON=...

# Optional: E-commerce Integration
SHOPIFY_STORE_DOMAIN=...
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
```

#### Step 3: Set Up Vector Database Connection

**Pinecone example:**
```python
from pinecone import Pinecone, ServerlessSpec

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Create index if doesn't exist
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,  # text-embedding-3-small
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

index = pc.Index(index_name)
```

#### Step 4: Create Base Prompt Templates

Create `prompts.py` or `prompts.ts`:
```python
SYSTEM_PROMPT = """You are a helpful assistant for {company_name}.

Your role is to answer questions based on the provided context from our documentation.

Guidelines:
- Only answer based on the provided context
- If information is not in the context, say "I don't have that information"
- Cite sources with page numbers when available
- Be concise and helpful
- Use a {tone} tone

Context will be provided with each question."""

GUARDRAIL_PROMPT = """Assess if the user input is allowed.

Allowed topics:
- {allowed_topics}

Not allowed:
- Off-topic questions
- Inappropriate content
- Requests outside our domain

Respond with only 'allowed' or 'not_allowed'."""
```

#### Step 5: Set Up Embedding Pipeline

Create `embeddings.py`:
```python
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFDirectoryLoader

class DocumentProcessor:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )

    def load_documents(self, directory: str):
        loader = PyPDFDirectoryLoader(directory)
        documents = loader.load()
        return documents

    def split_documents(self, documents):
        chunks = self.text_splitter.split_documents(documents)
        # Add metadata
        for i, chunk in enumerate(chunks):
            chunk.metadata["chunk_id"] = i
        return chunks

    def embed_documents(self, chunks):
        texts = [chunk.page_content for chunk in chunks]
        embeddings = self.embeddings.embed_documents(texts)
        return embeddings
```

#### Step 6: Create Basic Retrieval Function

Create `retrieval.py`:
```python
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings

class Retriever:
    def __init__(self, index_name: str):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.vectorstore = PineconeVectorStore(
            index_name=index_name,
            embedding=self.embeddings
        )

    def retrieve(self, query: str, k: int = 5):
        """Retrieve top k relevant documents"""
        docs = self.vectorstore.similarity_search(query, k=k)
        return docs

    def retrieve_with_scores(self, query: str, k: int = 5):
        """Retrieve with relevance scores"""
        docs_with_scores = self.vectorstore.similarity_search_with_score(query, k=k)
        return docs_with_scores
```

#### Step 7: Set Up Conversation Memory

**For OpenAI Assistants API:**
```python
# Managed automatically via threads
thread = client.beta.threads.create()
thread_id = thread.id  # Store this per user session
```

**For manual memory management:**
```python
# In-memory (development)
sessions = {}

def get_conversation_history(session_id: str):
    return sessions.get(session_id, [])

def update_conversation_history(session_id: str, message: dict):
    if session_id not in sessions:
        sessions[session_id] = []
    sessions[session_id].append(message)
    # Keep last 10 messages
    sessions[session_id] = sessions[session_id][-10:]
```

**For database-backed (production):**
```python
# PostgreSQL example
async def get_session(session_id: str):
    result = await db.execute(
        "SELECT conversation_history FROM sessions WHERE session_id = $1",
        session_id
    )
    return result[0]["conversation_history"] if result else []

async def save_session(session_id: str, history: list):
    await db.execute(
        """
        INSERT INTO sessions (session_id, conversation_history, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (session_id) DO UPDATE
        SET conversation_history = $2, updated_at = NOW()
        """,
        session_id, json.dumps(history)
    )
```

#### Step 8: Create Evaluation Harness

Create `scripts/evaluate.py`:
```python
import json
from typing import List, Dict

class RAGEvaluator:
    def __init__(self, test_cases_file: str):
        with open(test_cases_file) as f:
            self.test_cases = json.load(f)

    def evaluate_retrieval(self, retriever):
        """Evaluate retrieval quality"""
        results = []
        for case in self.test_cases:
            query = case["query"]
            expected_docs = case["expected_doc_ids"]

            retrieved = retriever.retrieve(query, k=5)
            retrieved_ids = [doc.metadata["chunk_id"] for doc in retrieved]

            # Calculate precision@5
            precision = len(set(retrieved_ids) & set(expected_docs)) / 5
            results.append({"query": query, "precision": precision})

        avg_precision = sum(r["precision"] for r in results) / len(results)
        return {"average_precision@5": avg_precision, "results": results}

    def evaluate_generation(self, chatbot):
        """Evaluate answer quality"""
        results = []
        for case in self.test_cases:
            query = case["query"]
            expected_answer = case["expected_answer"]

            actual_answer = chatbot.generate_answer(query)

            # Use LLM-as-judge
            score = self.llm_judge(expected_answer, actual_answer)
            results.append({"query": query, "score": score})

        avg_score = sum(r["score"] for r in results) / len(results)
        return {"average_score": avg_score, "results": results}

    def llm_judge(self, expected: str, actual: str) -> float:
        """Use GPT-4 to judge answer quality"""
        prompt = f"""
        Compare these answers on scale of 0-1:

        Expected: {expected}
        Actual: {actual}

        Score (0-1):
        """
        # Call LLM and parse score
        return 0.8  # Placeholder

# Create test cases JSON
test_cases = [
    {
        "query": "What is the return policy?",
        "expected_doc_ids": [42, 43],
        "expected_answer": "30-day return policy with receipt"
    },
    # Add 20-50 test cases
]
```

#### Step 9: Add Example Data Ingestion Script

Create `scripts/ingest_data.py`:
```python
import asyncio
from app.services.embeddings import DocumentProcessor
from langchain_pinecone import PineconeVectorStore

async def ingest():
    processor = DocumentProcessor()

    print("Loading documents...")
    documents = processor.load_documents("data/raw")
    print(f"Loaded {len(documents)} documents")

    print("Splitting into chunks...")
    chunks = processor.split_documents(documents)
    print(f"Created {len(chunks)} chunks")

    print("Embedding and storing in Pinecone...")
    vectorstore = PineconeVectorStore.from_documents(
        chunks,
        processor.embeddings,
        index_name="my-chatbot-index"
    )

    print("Ingestion complete!")

if __name__ == "__main__":
    asyncio.run(ingest())
```

### 5. Testing Strategy

Based on CoPilot patterns and 2026 best practices:

#### Unit Tests for Retrieval

```python
def test_retrieval_accuracy():
    retriever = Retriever(index_name="test-index")
    query = "What is the warranty period?"
    docs = retriever.retrieve(query, k=5)

    assert len(docs) == 5
    assert any("warranty" in doc.page_content.lower() for doc in docs)
    assert all(hasattr(doc, "metadata") for doc in docs)
```

#### Evaluation Set for Answer Quality

Create `test_cases.json`:
```json
[
  {
    "query": "What are your shipping options?",
    "expected_keywords": ["standard", "express", "international"],
    "expected_source_pages": [12, 13]
  },
  {
    "query": "How do I return a product?",
    "expected_keywords": ["30 days", "receipt", "original packaging"],
    "expected_source_pages": [18]
  }
]
```

#### Load Testing for Scale

```python
import asyncio
import time

async def load_test(num_concurrent: int = 10):
    async def single_request():
        start = time.time()
        response = await chatbot.generate_answer("What is your return policy?")
        latency = time.time() - start
        return latency

    tasks = [single_request() for _ in range(num_concurrent)]
    latencies = await asyncio.gather(*tasks)

    print(f"Concurrent requests: {num_concurrent}")
    print(f"Average latency: {sum(latencies) / len(latencies):.2f}s")
    print(f"P95 latency: {sorted(latencies)[int(len(latencies) * 0.95)]:.2f}s")
```

#### Hallucination Detection

```python
def detect_hallucination(query: str, context: str, answer: str) -> bool:
    """Check if answer contains information not in context"""
    prompt = f"""
    Context: {context}
    Answer: {answer}

    Does the answer contain information NOT in the context?
    Respond with 'yes' or 'no'.
    """
    response = llm.generate(prompt)
    return response.strip().lower() == "yes"
```

#### Monitoring in Production

```python
# Log all queries and responses
@app.post("/chat")
async def chat(request: ChatRequest):
    start_time = time.time()

    try:
        response = await chatbot.generate_answer(request.query)
        latency = time.time() - start_time

        # Log to analytics
        log_event({
            "event": "chat_query",
            "query": request.query,
            "response_length": len(response),
            "latency": latency,
            "session_id": request.session_id
        })

        return {"response": response}
    except Exception as e:
        log_error({"error": str(e), "query": request.query})
        raise
```

## Implementation Checklist

After scaffolding, guide user through:

- [ ] Environment setup (API keys, database)
- [ ] Data ingestion (run `scripts/ingest_data.py`)
- [ ] Test retrieval quality (run evaluation)
- [ ] Refine system prompts based on results
- [ ] Test conversation flows
- [ ] Set up monitoring/logging
- [ ] Deploy to staging environment
- [ ] Run load tests
- [ ] Create user documentation
- [ ] Set up feedback collection mechanism
- [ ] Plan for continuous improvement

## Best Practices Summary (2026)

1. **Intelligent Chunking**: Test multiple strategies (by paragraph, by section, fixed size) and measure retrieval precision
2. **Hybrid Retrieval**: Combine BM25 (keyword) + vector search for 15-25% accuracy improvement on technical docs
3. **Query Reformulation**: Rewrite follow-up questions using conversation history before retrieval
4. **LLM-as-Judge**: Use GPT-4o to evaluate answer quality (80%+ accuracy)
5. **Separate Component Testing**: Test retrieval and generation independently before end-to-end
6. **Guardrails First**: Validate input topics before expensive LLM calls
7. **Citation Always**: Include source metadata (page numbers, document names) in responses
8. **Continuous Evaluation**: Run automated tests on every prompt/model change
9. **Cost Monitoring**: Track tokens used per conversation, optimize with caching
10. **Security**: Test for PII leakage, prompt injection, toxic content generation

## Next Steps

After scaffolding complete:

1. Run ingestion pipeline on sample data
2. Test retrieval quality with evaluation harness
3. Refine prompts based on test results
4. Implement feedback loop (thumbs up/down)
5. Monitor production metrics (latency, accuracy, cost)
6. Iterate based on user feedback

## Resources & References

**RAG Best Practices:**
- [ChatRAG: 7 Best Practices for RAG Implementation](https://www.chatrag.ai/blog/2026-02-06-7-best-practices-for-rag-implementation-that-actually-improve-your-ai-results)
- [Botpress: How to Build a RAG Chatbot](https://botpress.com/blog/build-rag-chatbot)
- [The New Stack: Practical Guide to RAG-Powered Chatbot](https://thenewstack.io/a-practical-guide-to-building-a-rag-powered-chatbot/)

**Vector Database Selection:**
- [Encore: Best Vector Databases Comparison 2026](https://encore.dev/articles/best-vector-databases)
- [Firecrawl: Complete Vector Database Comparison](https://www.firecrawl.dev/blog/best-vector-databases)
- [ALOA: Pinecone vs Weaviate vs Chroma](https://aloa.co/ai/comparisons/vector-database-comparison/pinecone-vs-weaviate-vs-chroma)

**Prompt Engineering for RAG:**
- [Michael Brenndoerfer: RAG Prompt Engineering](https://mbrenndoerfer.com/writing/rag-prompt-engineering-context-citations)
- [Prompt Engineering Guide: RAG Techniques](https://www.promptingguide.ai/techniques/rag)
- [Medium: Beyond Prompt Engineering - RAG, MCP, and Skills](https://medium.com/@ramanan.venkat.v/beyond-prompt-engineering-rag-mcp-and-skills-the-three-pillars-of-production-grade-llm-f84d5a0558c9)

**Conversation Memory Patterns:**
- [Haystack: Conversational RAG with InMemoryChatMessageStore](https://haystack.deepset.ai/tutorials/48_conversational_rag)
- [Medium: Memory-Enhanced RAG Chatbot with LangChain](https://medium.com/@saurabhzodex/memory-enhanced-rag-chatbot-with-langchain-integrating-chat-history-for-context-aware-845100184c4f)
- [Mem0: Agentic RAG Chatbot with Memory](https://mem0.ai/blog/agentic-rag-chatbot-with-memory)

**RAG Evaluation:**
- [Patronus AI: RAG Evaluation Metrics](https://www.patronus.ai/llm-testing/rag-evaluation-metrics)
- [Evidently AI: Complete Guide to RAG Evaluation](https://www.evidentlyai.com/llm-guide/rag-evaluation)
- [Qdrant: Best Practices in RAG Evaluation](https://qdrant.tech/blog/rag-evaluation-guide/)
- [Label Your Data: RAG Evaluation 2026](https://labelyourdata.com/articles/llm-fine-tuning/rag-evaluation)
