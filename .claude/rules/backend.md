# 백엔드 연동

BE 연동 작업(API 추가·수정, 인증 흐름, 스키마 변경, BE 동작 분석) 전에 아래를 먼저 직접 읽는다. 사용자에게 링크·설명을 요청하지 않는다.

## BE 레포 (로컬 클론 없음, `gh api`로 읽기)

https://github.com/mash-up-kr/udumeoli-spring

```bash
gh api repos/mash-up-kr/udumeoli-spring/contents/<path> --jq .content | base64 -d
gh api repos/mash-up-kr/udumeoli-spring/commits --jq '.[0:10][] | "\(.sha[0:7]) \(.commit.message | split("\n")[0])"'
```

- GraphQL 스키마: `src/main/resources/graphql/schema.graphqls`
- REST: `src/main/kotlin/udumeoli/tripphoto/<도메인>/web/*Controller.kt`
- 인증·OAuth·CORS: `src/main/kotlin/udumeoli/tripphoto/auth/`, `src/main/resources/application*.yml`

## 운영 GraphQL (배포된 스키마 기준)

https://pinnnned.duckdns.org/graphql — 인트로스펙션 열려 있음. GraphiQL: https://pinnnned.duckdns.org/graphiql?path=/graphql

```bash
curl -s -X POST https://pinnnned.duckdns.org/graphql -H 'Content-Type: application/json' \
  -d '{"query":"{ __type(name: \"Mutation\") { fields { name args { name type { name kind ofType { name } } } } } }"}'
```

REST 동작도 curl로 직접 확인한다.

## 원칙

- 노션·슬랙 메모보다 코드·배포본이 우선. 다르면 사용자에게 알린다.
- BE 문제면 FE 우회 수정 금지. 원인 파일·라인을 짚어 BE 전달 내용을 정리한다.
