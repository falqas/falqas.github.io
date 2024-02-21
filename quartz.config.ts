import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    // pageTitle: "🪴 Quartz 4.0",
    pageTitle: " Faisal 3.1",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    // baseUrl: "quartz.jzhao.xyz",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      typography: {
        header: "Source Code Pro",
        body: "Source Code Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        darkMode: {
          // page background
          light: "#282828",
          // borders
          lightgray: "#3c3836",
          // graph links, heavier borders
          gray: "#a89984",
          // body text
          darkgray: "#a89984",
          // header text & icons
          dark: "#83a598",
          // link color, current graph node
          secondary: "#fabd2f",
          // hover states, visited graph nodes
          tertiary: "#928374",
          // internal link background, highlighted text, highlighted lines of code
          highlight: "rgba(143, 159, 169, 0.15)",
        },
        lightMode: {
          light: "#fbf1c7",
          lightgray: "#ebdbb2",
          gray: "#7c6f64",
          darkgray: "#3c3836",
          dark: "#282828",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.TableOfContents(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"], // you can add 'git' here for last modified from Git but this makes the build slower
      }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.Description(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources({ fontOrigin: "googleFonts" }),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
