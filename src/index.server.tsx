/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */

import {
  renderToString,
  RenderToStringOptions,
  QwikLoader,
} from "@builder.io/qwik/server";
import { Stories, Story, User, Nav } from "./components";
import { getStories, getStory, getUser } from "./api";
import Router from "url-router";

const router = new Router({
  "/stories/:id": {
    Page: Story,
    getData(url: URL, params: { id: number }) {
      return getStory(params.id);
    },
  },
  "/users/:id": {
    Page: User,
    getData(url: URL, params: { id: number }) {
      return getUser(params.id);
    },
  },
  "(.*)": {
    Page: Stories,
    async getData(url: URL) {
      const { searchParams } = url;
      const type = searchParams.get("type") || "top";
      const page = parseInt(searchParams.get("page") as string, 10) || 1;
      const stories = await getStories(type as any, page);
      return { type, page, stories };
    },
  },
});

/**
 * Entry point for server-side pre-rendering.
 *
 * @returns a promise when all of the rendering is completed.
 */
export async function renderApp(opts: RenderToStringOptions) {
  const url = opts.url!.pathname + opts.url!.search;
  const {
    handler: { Page, getData },
    params,
  } = router.find(url);
  const data = await getData(opts.url, params);

  return renderToString(
    <html>
      <head>
        <title>Qwik Hackernews</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Hacker News Clone built with Qwik" />
        <link rel="stylesheet" href="/index.css" />
      </head>
      <body q:base="/build/">
        <Nav />
        <Page url={url} param={params} data={data} />
        <QwikLoader debug={opts.debug} />
      </body>
    </html>,
    opts
  );
}
