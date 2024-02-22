import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
    links: {
      // GitHub: "https://github.com/falqas",
      // "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta(), Component.TagList()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    // Component.Darkmode(),
    // Component.DesktopOnly(Component.Explorer()),
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Recent Notes",
        limit: 3,
        filter: (f) => f.slug! !== "index" && !f.frontmatter?.noindex,
        linkToMore: "/notes" as SimpleSlug,
      }),
    ),
  ],
  right: [
    // Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    // Component.Backlinks(),
    Component.MobileOnly(
      Component.RecentNotes({
        title: "Recent Notes",
        limit: 3,
        filter: (f) => f.slug! !== "index" && !f.frontmatter?.noindex,
        linkToMore: "/notes" as SimpleSlug,
      }),
    ),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    // Component.Darkmode(),
  ],
  right: [],
}
