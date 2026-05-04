const fs = require("fs")
const path = require("path")

const dir = path.join(process.cwd(), "data")
const file = path.join(dir, "connections.json")

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

if (!fs.existsSync(file)) {
  fs.writeFileSync(file, "[]", "utf-8")
}