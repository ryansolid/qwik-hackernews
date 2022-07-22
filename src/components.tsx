import { component$, useStore, Slot } from "@builder.io/qwik";
import type { IStory, IComment, IUser } from "./types";

/* eslint no-console: ["off"] */
export const pluralize = (n: number) => n + (n === 1 ? " reply" : " replies");

export const Nav = component$(
  () => (
    <header class="header">
      <nav class="inner">
        <a href="/">
          <strong>HN</strong>
        </a>
        <a href="/?type=new">
          <strong>New</strong>
        </a>
        <a href="/?type=show">
          <strong>Show</strong>
        </a>
        <a href="/?type=ask">
          <strong>Ask</strong>
        </a>
        <a href="/?type=job">
          <strong>Jobs</strong>
        </a>
        <a
          class="github"
          href="http://github.com/builderio/qwikdev"
          target="_blank"
          rel="noreferrer"
        >
          Built with Qwik
        </a>
      </nav>
    </header>
  ),
  { tagName: "nav" }
);

export const StoryPreview = component$(
  (props: { story: IStory }) => (
    <li class="news-item">
      <span class="score">{props.story.points}</span>
      <span class="title">
        {props.story.url && !props.story.url.startsWith("item?id=") ? (
          <>
            <a href={props.story.url} target="_blank" rel="noreferrer">
              {props.story.title}
            </a>
            <span class="host"> ({props.story.domain})</span>
          </>
        ) : (
          <a href={`/item/${props.story.id}`}>{props.story.title}</a>
        )}
      </span>
      <br />
      <span class="meta">
        {props.story.type !== "job" ? (
          <>
            by <a href={`/users/${props.story.user}`}>{props.story.user}</a>{" "}
            {props.story.time_ago} |{" "}
            <a href={`/stories/${props.story.id}`}>
              {props.story.comments_count
                ? `${props.story.comments_count} comments`
                : "discuss"}
            </a>
          </>
        ) : (
          <a href={`/stories/${props.story.id}`}>{props.story.time_ago}</a>
        )}
      </span>
      {props.story.type !== "link" && (
        <>
          {" "}
          <span class="label">{props.story.type}</span>
        </>
      )}
    </li>
  ),
  { tagName: "story-preview" }
);

export const Toggle = component$(() => {
  const state = useStore({ open: true });
  return (
    <>
      <div class={state.open ? "toggle open" : "toggle"}>
        <a onClick$={() => (state.open = !state.open)}>
          {state.open ? "[-]" : "[+] collapsed"}
        </a>
      </div>
      {state.open && (
        <ul class="comment-children">
          <Slot />
        </ul>
      )}
    </>
  );
});

export const Comment = component$(
  (props: { comment: IComment }) => {
    return (
      <li class="comment">
        <div class="by">
          <a href={`/users/${props.comment.user}`}>{props.comment.user}</a>{" "}
          {props.comment.time_ago}
        </div>
        <div class="text" innerHTML={props.comment.content} />
        {!!props.comment.comments.length && (
          <Toggle>
            {props.comment.comments.map((comment) => (
              <Comment comment={comment} />
            ))}
          </Toggle>
        )}
      </li>
    );
  },
  { tagName: "comment" }
);

export const Stories = component$(
  (props: { path: string; params: any; data: any }) => {
    const { stories, page, type } = props.data;
    return (
      <div class="news-view">
        <div class="news-list-nav">
          {page > 1 ? (
            <a
              class="page-link"
              href={`/?type=${type}&page=${page - 1}`}
              aria-label="Previous Page"
            >
              {"<"} prev
            </a>
          ) : (
            <span class="page-link disabled" aria-disabled="true">
              {"<"} prev
            </span>
          )}
          <span>page {page}</span>
          {stories && stories.length >= 29 ? (
            <a
              class="page-link"
              href={`/?type=${type}&page=${page + 1}`}
              aria-label="Next Page"
            >
              more {">"}
            </a>
          ) : (
            <span class="page-link disabled" aria-disabled="true">
              more {">"}
            </span>
          )}
        </div>
        <main class="news-list">
          {stories && (
            <ul>
              {stories.map((story: IStory) => (
                <StoryPreview story={story} />
              ))}
            </ul>
          )}
        </main>
      </div>
    );
  },
  { tagName: "stories" }
);

export const Story = component$(
  (props: { path: string; params: any; data: IStory }) => (
    <>
      {props.data && (
        <div class="item-view">
          <div class="item-view-header">
            <a href={props.data.url} target="_blank">
              <h1>{props.data.title}</h1>
            </a>
            {props.data.domain && (
              <span class="host">({props.data.domain})</span>
            )}
            <p class="meta">
              {props.data.points} points | by{" "}
              <a href={`/users/${props.data.user}`}>{props.data.user}</a>{" "}
              {props.data.time_ago} ago
            </p>
          </div>
          <div class="item-view-comments">
            <p class="item-view-comments-header">
              {props.data.comments_count
                ? props.data.comments_count + " comments"
                : "No comments yet."}
            </p>
            <ul class="comment-children">
              {props.data.comments.map((comment) => (
                <Comment comment={comment} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  ),
  { tagName: "story" }
);

export const User = component$(
  (props: { path: string; params: any; data: IUser }) => (
    <div class="user-view">
      {props.data && props.data.error ? (
        <h1>User not found.</h1>
      ) : (
        <>
          <h1>User : {props.data.id}</h1>
          <ul class="meta">
            <li>
              <span class="label">Created:</span> {props.data.created}
            </li>
            <li>
              <span class="label">Karma:</span> {props.data.karma}
            </li>
            {props.data.about && (
              <li class="about" innerHTML={props.data.about} />
            )}
          </ul>
          <p class="links">
            <a
              href={`https://news.ycombinator.com/submitted?id=${props.data.id}`}
            >
              submissions
            </a>{" "}
            |{" "}
            <a
              href={`https://news.ycombinator.com/threads?id=${props.data.id}`}
            >
              comments
            </a>
          </p>
        </>
      )}
    </div>
  ),
  { tagName: "user " }
);
