# Desafio Backend

### Para instalar as dependências
```
npm i
```

### Iniciando o servidor
```
npm start
```  

### Para rodar lint no projeto
```
npm run lint    
```  

### Para rodar os testes do projeto
```
npm run test
```

# Descrição do Projeto

Servidor roda na porta 3000. Projeto foi feito utilizando [nestjs](https://nestjs.com)

### Endpoints

Retorna todas as regras de atendimento
```
GET http://localhost:3000/api/regra-atendimento
```

Retorna todos as regras de atendimento dentro daquele intervalo
```
Parâmetro: 
{
	nomeDaRegra: string, não é possível cadastrar um regra de atendimento com nome duplicado
	tipoRegraAtendimento: string, permite os tipos U, D, S 
	horario:
		{
            dia: string, formato DD-MM-YYYY só é obrigatório quando o tipo de regra é U
			diasDisponiveis: array numbers, Só é permitido de 1 a 7. Só é obrogatório quando regra de atendimento é S  
			intervalos: [ intervalos são sempre obrigatórios
				{
					inicio: string, formato HH:mm
					fim: string, formato HH:mm
				}
			]
		}
	
}
GET http://localhost:3000/api/regra-atendimento/intervalo
```

Cadastra uma nova regra de atendimento
```
Parâmetro: 
{
    inicio: string, formato DD-MM-YYYY
    fim: string, formato DD-MM-YYYY
}
POST http://localhost:3000/api/regra-atendimento
```

Deleta uma regra de atendimento
```
Parâmetro: Pode passar qualquer um dos dois parâmetros que ele deleta pelos dois.
Se passar os dois ele vai deletar pelo id.
{
    id: number
    nomeDaRegra: string 
}
DELETE http://localhost:3000/api/regra-atendimento
```

### Arquivo de exemplo de requisições na pasta raiz do projeto.