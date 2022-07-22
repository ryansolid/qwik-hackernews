import { Stories, Story, User, Nav } from "./components";

const lookup: Record<string, any> = {
  "stories": Stories,
  "story": Story,
  "user": User
}

export default function Root(props: any) {
  const Page = lookup[props.page];
  return (
    <html>
      <head>
        <title>Qwik Hackernews</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Hacker News Clone built with Qwik" />
        <link rel="stylesheet" href="/index.css" />
      </head>
      <body>
        <Nav />
        <Page url={props.url} param={props.params} data={props.data} />
      </body>
    </html>
  );
}
