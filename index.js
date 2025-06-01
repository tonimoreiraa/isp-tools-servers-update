const fs = require('fs');

const url = 'http://www.isp.tools/ping';
const outputPath = process.env.OUTPUT_PATH || 'servers.json';

async function fetchPageAndExtractServers() {
    try {
        const response = await fetch(url, {
            "cache": "default",
            "credentials": "include",
            "headers": {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
                "Priority": "u=0, i",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15"
            },
            "method": "GET",
            "mode": "cors",
            "redirect": "follow",
            "referrer": "http://www.isp.tools/",
            "referrerPolicy": "strict-origin-when-cross-origin"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.text();
        
        // Divide o conteúdo em linhas
        const lines = data.split('\n');
        
        // Procura pela linha que contém "var testServers ="
        const targetLine = lines.find(line => 
            line.trim().includes('var testServers =')
        );
        
        if (!targetLine) {
            console.error('Linha "var testServers =" não encontrada');
            return;
        }
        
        console.log('Linha encontrada:', targetLine.trim());
        
        // Extrai o conteúdo após o "="
        const equalIndex = targetLine.indexOf('=');
        if (equalIndex === -1) {
            console.error('Símbolo "=" não encontrado na linha');
            return;
        }
        const endIndex = targetLine.indexOf(';', equalIndex);
        if (endIndex === -1) {
            console.error('Símbolo ";" não encontrado na linha');
            return;
        }
        
        let jsonContent = targetLine.substring(equalIndex + 1, endIndex).trim();
        
        // Verifica se é um JSON válido
        try {
            const parsedJson = JSON.parse(jsonContent);
            
            // Salva no arquivo servers.json com formatação
            const transformedJson = parsedJson.map(line => ({
                id: Number(line[0]),
                name: line[1],
                address: line[2],
            }))

            const formattedJson = JSON.stringify(transformedJson, null, 2);
            
            fs.rmSync(outputPath, { force: true });
            fs.writeFileSync(outputPath, formattedJson, 'utf8');
            console.log('Arquivo servers.json criado com sucesso!');
            console.log('Conteúdo extraído e formatado:');
            console.log(transformedJson);
            
        } catch (parseError) {
            console.error('Erro ao parsear JSON:', parseError.message);
            console.log('Conteúdo bruto extraído:', jsonContent);
        }
        
    } catch (error) {
        console.error('Erro ao fazer requisição ou processar conteúdo:', error.message);
    }
}

// Executa a função
console.log('Carregando página e extraindo dados...');
fetchPageAndExtractServers();