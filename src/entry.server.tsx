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
} from "@builder.io/qwik/server";
import { getStories, getStory, getUser } from "./api";
import Root from "./root";
import Router from "url-router";

const router = new Router({
  "/stories/:id": {
    page: "story",
    getData(url: URL, params: { id: number }) {
      return getStory(params.id);
    },
  },
  "/users/:id": {
    page: "user",
    getData(url: URL, params: { id: number }) {
      return getUser(params.id);
    },
  },
  "(.*)": {
    page: "stories",
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
export async function render(opts: RenderToStringOptions) {
  const url = (opts.url as URL).pathname + opts.url!.search;
  const {
    handler: { page, getData },
    params,
  } = router.find(url) as any;
  const data = await getData(opts.url, params);

  return renderToString(<Root page={page} url={url} data={data} params={params} />,
    { ...opts }
  );
}

