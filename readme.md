```
 █████╗ ███╗   ██╗███████╗ ██████╗ ███████╗███╗   ██╗████████╗
██╔══██╗████╗  ██║██╔════╝██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
███████║██╔██╗ ██║█████╗  ██║  ███╗█████╗  ██╔██╗ ██║   ██║   
██╔══██║██║╚██╗██║██╔══╝  ██║   ██║██╔══╝  ██║╚██╗██║   ██║   
██║  ██║██║ ╚████║███████╗╚██████╔╝███████╗██║ ╚████║   ██║   
╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   

███████╗                               ███████╗          █████╗  
██╔════╝     ╔═══╗          ╔═══╗      ╚════██║         ██╔═══╝
██║          ║   ║          ║   ║           ██║        ██╔╝
██║          ╚═══╝          ╚═══╝           ██║        ██║
██║                                         ██║        ██║
██║                                         ██║        ██║
██║                                         ██║       ██╔╝
███████╗           ███████╗            ███████║   █████╔╝
╚══════╝           ╚══════╝            ╚══════╝   ╚════╝
```
# Yet another CLI agent
## About this project
This was created to expose "agents" for what they are:
API calls to LLMs in a loop.

This was built to learn about how to build custom agents and devising ways to give them tool capabilities.

## how to use
- this requires Node JS to run
- clone this repo and run `npm i` to install necessary packages
- run `npm start` to interact with the agent
- It currently has capabilities to `list`, `read`, `create`, `update` and `delete` files, so it can be used like a coding assistant.

## Supported AI Models
This project supports multiple AI model APIs:
- **OpenAI** (GPT-4, GPT-3.5, etc.)
- **Claude** (Anthropic - Claude 3.5 Sonnet, Opus, Haiku)
- **Ollama** (Local LLMs - Llama 2, Mistral, CodeLlama, etc.)

See [API_HANDLERS.md](./API_HANDLERS.md) for detailed documentation on how to use each API handler, including:
- API endpoints and authentication
- Environment variable configuration
- Code examples
- Creating custom API handlers