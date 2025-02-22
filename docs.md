//Partially auto-generated

# Exa & Deepseek R1 1776 Chat App

## Repository Purpose and "What is it" Summary

This repository contains a chat application called "Deepsexa". It combines web search capabilities with a reasoning language model. It uses the Exa API for web search and the Perplexity-hosted r1-1776 model (based on Deepseek R1) for generating responses.  The application is built with Next.js, Tailwind CSS, and TypeScript, and utilizes the Vercel AI SDK for AI integration.

## Quick Start: Installation and Basic Usage

1.  **Prerequisites:**
    *   Node.js installed.
    *   Exa API key. Obtain one from the [Exa Dashboard](https://dashboard.exa.ai/api-keys).
    *   Perplexity API key. Obtain one from [Perplexity Dashboard](https://www.perplexity.ai/settings/api).

2.  **Installation:**

    *   Clone the repository:
        ```bash
        git clone https://github.com/lecigarevolant/deepsexa-r1.git
        cd deepsexa-r1
        ```

    *   Install dependencies:
        ```bash
        npm install
        ```

3.  **Configuration:**

    *   Set environment variables for your Exa and Perplexity API keys. Create a `.env` file in the root of the project and add:
      ```
      EXA_API_KEY=your_exa_api_key
      PERPLEXITY_API_KEY=your_perplexity_api_key
      ```
      Replace `your_exa_api_key` and `your_perplexity_api_key` with your actual API keys.

4.  **Run the application:**

    ```bash
    npm run dev
    ```

5.  **Access the application:** Open your web browser and go to `http://localhost:3000/deepsexa`.

6.  **Basic Usage**: Type a question into the chat input field and press Ctrl+Enter (or Cmd+Enter on Mac) to send. The application will perform a web search using Exa, and then use the search results and the Deepseek R1-1776 model to generate a response.

## Configuration Options

The primary configuration options involve setting the Exa and Perplexity API keys via environment variables, as described in the Quick Start section.

The application also supports configurable search settings, accessible through a settings modal within the user interface. These settings allow users to modify:

*   **Search Type:**  `auto` (default), `keyword`, or `neural`. Auto mode intelligently selects between neural and keyword based on the query type.
*   **Number of Results:**  From 1 to 10 (default: 10).
*   **Live Crawling:** `always` (default), `fallback`, or `never`. Set to "always" to ensure fresh content.
*   **Content Settings**:
    * **Include Text Content**: Whether to include text from web pages in the search results (default: disabled).
    	* **Max Characters**: If text content enabled, recommended setting is 10,000 characters for comprehensive coverage.
	* **Include Highlights**: Show highlights from the search results (default: disabled).
		* **Sentences per Highlight**: If highlighting is enabled, you can determine the number of highlight sentences.
	* **Include Summary**: Include the summary from results (default: enabled).

<details>
<summary>Advanced Settings (Not Tested)</summary>

The following settings are available in the interface but have not been fully tested in the application:

* **Autoprompt**: Control query rewriting (default: true for auto/neural)
* **Domain Filtering**:
    * **Include Domains**: List of domains to specifically search
    * **Exclude Domains**: List of domains to exclude from search
* **Date Filtering**:
    * **Published Date Range**: Filter by when content was published
    * **Crawl Date Range**: Filter by when Exa indexed the content
* **Category Filtering**: Limit results to specific content types:
    * `research_paper`
    * `news`
    * `blog`
    * `social_media`
    * `discussion`
    * `other`
* **Advanced Content Settings**:
    * **Highlight Query**: Custom query for highlighting relevant content
    * **Summary Length**: Maximum number of sentences in result summaries

All date inputs must use ISO 8601 format (YYYY-MM-DD).
</details>

These settings are managed within the `components/settings-modal.tsx` component and use the `ExaSearchSettings` interface defined in `app/types.ts`.

## Packages, Public Features, Interfaces and API documentation.

This repository contains a single package that builds the whole application.

### Public Features and APIs

The application exposes two main API routes:

1.  **`/api/chat` (POST):** Handles chat requests.
    *   **Purpose:**  Processes user messages, integrates search results, and streams responses from the Deepseek R1-1776 model.
    *   **Request Body:**
        *   `messages`: An array of message objects (`app/types.ts` `ChatMessage` interface). Each message has `id`, `role` (`user`, `assistant`, or `system`), and `content`.
        *   `searchContext`: A string containing formatted search results obtained from the `deepsexa/api/exawebsearch` route.
    *   **Response:** A streamed text response from the Deepseek R1-1776 model. The stream includes reasoning steps (`<think>...</think>`) and the final response.
    *   **Error Handling:** Returns a JSON response with an `error` message and `details` if an error occurs.
    *   **Implementation:** `app/api/chat/route.ts`
    *	**Max Duration**: The maximum execution time for this route is set by `CHAT_MAX_DURATION` and is currently 300 seconds (5 minutes) defined in `app/constants/api.ts`.

2.  **`deepsexa/api/exawebsearch` (POST):** Performs web searches using the Exa API.
    *   **Purpose:**  Conducts contextual web searches based on the user's query and previous queries.
    *   **Request Body:**
        *   `query`: The user's current search query (string).
        *   `previousQueries`: An array of previous queries (strings) to provide context.
        *   `settings`: An object (`app/types.ts`, `ExaSearchSettings` interface) specifying search parameters, see "Configuration Options".
    *   **Response:** A JSON object containing:
        *   `results`: An array of search result objects (`app/types.ts`, `SearchResult` interface).
        *   `formattedResults`: A string containing the formatted search results, ready for inclusion in the prompt to the language model.
    *   **Error Handling:** Returns a JSON response with an `error` message if the search fails.
    *   **Implementation:** `app/api/exawebsearch/route.ts`
	*	**Max Duration**: The maximum execution time for this route is 60 seconds.

### Public Interfaces

*   **`ChatMessage` (`app/types.ts`):** Represents a chat message.
    ```typescript
    interface ChatMessage {
      id: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
    }
    ```

*   **`SearchResult` (`app/types.ts`):** Represents a single search result from Exa.
    ```typescript
    interface SearchResult {
      url: string;
      title: string;
      favicon?: string;
    }
    ```

*   **`ExaSearchSettings` (`app/types.ts`):** Defines the settings for Exa searches.
    ```typescript
    interface ExaSearchSettings {
      type: "auto" | "keyword" | "neural";
      numResults: number;
      livecrawl?: "always" | "fallback" | "never";
      text?: TextContentsOptions | boolean;
      highlights?: HighlightsContentsOptions | boolean;
      summary?: SummaryContentsOptions | boolean;
    }
    ```

    *   `TextContentsOptions`, `HighlightsContentsOptions`, `SummaryContentsOptions` are re-exported from the `exa-js` library. Refer to the `exa-js` documentation for details on these types.

*   **`WebSearchResponse` (`app/types.ts`):** Represents the structure of the response from the `/api/exawebsearch` route.

    ```typescript
    interface WebSearchResponse {
      results: SearchResult[];
      formattedResults?: string;
      error?: string;
    }
    ```

### Public Components

*   **`ChatInput` (`app/components/chat/ChatInput.tsx`):** The input field component for user queries. Props include handling input change, submission, loading state, and optional model notice display.

*   **`ChatMessage` (`app/components/chat/ChatMessage.tsx`):** Displays individual chat messages, differentiating between user and assistant messages. It handles parsing and displaying the thinking process and final response from the LLM.

*   **`SearchResults` (`app/components/chat/SearchResults.tsx`):** Displays the web search results from Exa. It includes an expandable list of search results with titles, URLs, and optional favicons.

*   **`SettingsModal` (`components/settings-modal.tsx`):** A modal dialog for configuring Exa search settings. Allows users to adjust search type, result count, live crawling, and content inclusion (text, highlights, summary).

*   **`ErrorBoundary` (`app/components/ErrorBoundary.tsx`):** A React error boundary component to gracefully handle unexpected errors in the application.

*   **`LoadingStates` (`app/components/LoadingStates.tsx`):** Contains components (`SearchingSpinner`, `ThinkingSpinner`) to display loading indicators during search and LLM processing.

### Hooks

* **`useAutoResizeTextarea` (`app/hooks/useAutoResizeTextarea.ts`):**  Provides auto-resizing functionality for the chat input textarea.

*   **`useChatLogic` (`app/hooks/useChatLogic.ts`):** Manages the core chat logic, integrating with the `useChat` hook from the `ai` library. Handles sending messages, receiving streamed responses, and managing loading states.

*   **`useLoadingDots` (`app/hooks/useLoadingDots.ts`):** Generates an animated loading dots string for visual feedback.

*   **`usePreviousQueries` (`app/hooks/usePreviousQueries.ts`):**  Keeps track of previous user queries to provide context for web searches.

*   **`useSearch` (`app/hooks/useSearch.ts`):** Manages the web search functionality, including performing searches, handling errors, and updating search settings.

### Utility Functions

* **`getAssetPath` (`app/utils.ts`):**  Constructs the correct path for static assets, considering the `basePath` configured in `next.config.mjs`.

* **`parseMessageContent` (`app/utils.ts`):** Parses the content of LLM messages to separate the "thinking" process from the final response.  Handles cases where the thinking process is complete or still in progress.

* **`retry` and `retryFetch` (`app/utils.ts`):** Provides functions for retrying asynchronous operations (specifically `fetch` requests) with exponential backoff, to improve robustness.

*   **`logger` (`app/utils/logger.ts`):** Provides logging functionality to both the console and a log file.  Logs are stored in the `logs` directory, with a new file created daily.

## Dependencies and Requirements

*   **Dependencies:**
    *   `@ai-sdk/perplexity`: For interacting with the r1-1776 model on the Perplexity API.
    *   `@vercel/analytics`: For Vercel Analytics integration.
    *   `ai`: Vercel AI SDK for streaming and chat functionality.
    *   `exa-js`:  Official Exa JavaScript client library.
    *   `next`: Next.js framework.
    *   `react`, `react-dom`: React library.
    *   `react-markdown`: For rendering Markdown content.
    *   `tailwindcss-animate`: Tailwind CSS plugin for animations.
    *   `@tailwindcss/typography`: Tailwind CSS plugin for typography.
* **Dev Dependencies:**
  	*   `@types/node`, `@types/react`, `@types/react-dom`: TypeScript types.
  	*   `postcss`, `tailwindcss`: For CSS processing.
  	* `typescript`: Typescript.

*   **Requirements:**
    *   Node.js (version specified in the project's configuration, likely >= 18).
    *   Exa API Key.
    *   Perplexity API Key.

