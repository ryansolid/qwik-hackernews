import { component, onRender$, useStore, $ } from "@builder.io/qwik";
import type { IStory, IComment, IUser } from "./types";

/* eslint no-console: ["off"] */
export const pluralize = (n: number) => n + (n === 1 ? " reply" : " replies");

export const Nav = component(
  "nav",
  $(() => {
    return onRender$(() => (
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
    ));
  })
);

export const StoryPreview = component(
  "story-preview",
  $((props: { story: IStory }) => {
    return onRender$(() => (
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
    ));
  })
);

export const Comment = component(
  "comment",
  $((props: { comment: IComment }) => {
    const state = useStore({ open: true });

    return onRender$(() => (
      <li class="comment">
        <div class="by">
          <a href={`/users/${props.comment.user}`}>{props.comment.user}</a>{" "}
          {props.comment.time_ago} ago
        </div>
        <div class="text">{props.comment.content}</div>
        {props.comment.comments.length && (
          <>
            <div class={state.open ? "toggle open" : "toggle"}>
              <a on$:click={() => (state.open = !state.open)}>
                {state.open
                  ? "[-]"
                  : "[+] " +
                    pluralize(props.comment.comments.length) +
                    " collapsed"}
              </a>
            </div>
            {state.open && (
              <ul class="comment-children">
                {props.comment.comments.map((comment) => (
                  <Comment comment={comment} />
                ))}
              </ul>
            )}
          </>
        )}
      </li>
    ));
  })
);

export const Stories = component(
  "stories",
  $((props: { path: string; params: any; data: any }) => {
    return onRender$(() => {
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
    });
  })
);

export const Story = component(
  "story",
  $((props: { path: string; params: any; data: any }) => {
    const story: IStory = props.data;
    return onRender$(
      () =>
        story && (
          <div class="item-view">
            <div class="item-view-header">
              <a href={story.url} target="_blank">
                <h1>{story.title}</h1>
              </a>
              {story.domain && <span class="host">({story.domain})</span>}
              <p class="meta">
                {story.points} points | by{" "}
                <a href={`/users/${story.user}`}>{story.user}</a>{" "}
                {story.time_ago} ago
              </p>
            </div>
            <div class="item-view-comments">
              <p class="item-view-comments-header">
                {story.comments_count
                  ? story.comments_count + " comments"
                  : "No comments yet."}
              </p>
              <ul class="comment-children">
                {story.comments.map((comment) => (
                  <Comment comment={comment} />
                ))}
              </ul>
            </div>
          </div>
        )
    );
  })
);

export const User = component(
  "user",
  $((props: { path: string; params: any; data: any }) => {
    const user: IUser = props.data;
    return onRender$(() => (
      <div class="user-view">
        {user && user.error ? (
          <h1>User not found.</h1>
        ) : (
          <>
            <h1>User : {user.id}</h1>
            <ul class="meta">
              <li>
                <span class="label">Created:</span> {user.created}
              </li>
              <li>
                <span class="label">Karma:</span> {user.karma}
              </li>
              {user.about && <li class="about">{user.about}</li>}
            </ul>
            <p class="links">
              <a href={`https://news.ycombinator.com/submitted?id=${user.id}`}>
                submissions
              </a>{" "}
              |{" "}
              <a href={`https://news.ycombinator.com/threads?id=${user.id}`}>
                comments
              </a>
            </p>
          </>
        )}
      </div>
    ));
  })
);
