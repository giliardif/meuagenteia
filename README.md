# 🤖 AgentBuilder — Seu Agente de IA

Agente de IA configurável para qualquer segmento de negócio.

---

## 🚀 Deploy em 5 minutos (Vercel)

### 1. Pré-requisitos
- Conta no [GitHub](https://github.com) (gratuito)
- Conta no [Vercel](https://vercel.com) (gratuito)
- Chave da API Anthropic: [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key

---

### 2. Suba o projeto no GitHub

```bash
# Na pasta do projeto:
git init
git add .
git commit -m "primeiro commit"

# Crie um repositório no GitHub e então:
git remote add origin https://github.com/SEU-USUARIO/meu-agente.git
git push -u origin main
```

---

### 3. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**
2. Importe o repositório que você criou no GitHub
3. Em **"Environment Variables"**, adicione:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-sua-chave-aqui`
4. Clique em **Deploy**
5. ✅ Em ~2 minutos sua URL estará pronta! Ex: `https://meu-agente-xyz.vercel.app`

---

### 4. Testar localmente (opcional)

```bash
# Instale as dependências
npm install

# Crie o arquivo de variáveis
cp .env.example .env.local
# Edite .env.local e coloque sua chave real

# Rode o servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:3000
```

---

## 📁 Estrutura do Projeto

```
meu-agente/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.js     ← Rota segura (API key fica aqui)
│   ├── layout.jsx           ← Layout raiz
│   └── page.jsx             ← App principal (Admin + Chat)
├── .env.example             ← Modelo do arquivo de variáveis
├── .gitignore               ← Protege sua chave da API
├── next.config.js
├── package.json
└── README.md
```

---

## 🔒 Segurança

- A `ANTHROPIC_API_KEY` **nunca é exposta** no frontend
- Todas as chamadas à API passam pela rota `/api/chat` (server-side)
- O `.env.local` está no `.gitignore` — nunca vai para o GitHub

---

## 💡 Personalizando o Agente

Edite o arquivo `app/page.jsx`:

- **`DEFAULT_KB`** — dados iniciais da empresa, FAQs, serviços e equipe
- **`buildSystemPrompt`** — lógica de como o conhecimento é passado para a IA
- **`SEGMENTS`** — lista de segmentos disponíveis no painel admin
- **`TONES`** — tons de voz disponíveis

---

## 📞 Próximos Passos

- [ ] Conectar banco de dados para persistir as configurações
- [ ] Integração com Google Calendar para agendamentos reais
- [ ] WhatsApp Business API
- [ ] Autenticação para proteger o painel admin
- [ ] Upload de PDFs para base de conhecimento (RAG)
