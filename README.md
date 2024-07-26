## Getting Started

Install dependencies
```bash
npm install
```
### Env's
- Create two files in root project, a '.env' based in ".env.example" and other '.env.test' based in ".env.test.example"

### Tests
Execute tests
```bash
npm run test 
```
### Migrations

Execute migrations
```bash
npm run knex -- migrate:latest 
```

Run the development server:

```bash
npm run dev
```
Open [http://localhost:3333](http://localhost:3333) with your browser to see the result.