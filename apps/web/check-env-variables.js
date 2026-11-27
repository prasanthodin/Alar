const c = require("ansi-colors")

const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_BACKEND_URL",
    description: "URL of the commerce kernel, e.g. http://localhost:9000",
  },
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    description:
      "The kernel's publishable key: psql \"$DATABASE_URL\" -Atc \"select token from api_key where type = 'publishable'\"",
  },
]

function checkEnvVariables() {
  const missingEnvs = requiredEnvs.filter((env) => !process.env[env.key])

  if (missingEnvs.length > 0) {
    console.error(c.red.bold("\nError: Missing required environment variables\n"))
    missingEnvs.forEach((env) => {
      console.error(c.yellow(`  ${c.bold(env.key)}`))
      console.error(c.dim(`    ${env.description}\n`))
    })
    console.error(
      c.yellow(
        "\nSet these variables in apps/web/.env.local or the environment before starting the website.\n"
      )
    )
    process.exit(1)
  }
}

module.exports = checkEnvVariables
