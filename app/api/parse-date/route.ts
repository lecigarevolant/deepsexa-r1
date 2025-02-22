import { OpenAI } from "openai";
import { DateRangeResponse, DateParserRequest } from "@/app/types/date-parser";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/app/utils/logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export async function POST(req: NextRequest) {
  try {
    const { query, previousQueries = [] } =
      (await req.json()) as DateParserRequest;

    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a temporal context analyzer for search queries. Analyze the query and conversation history to detect implied date ranges.

Current Date: ${currentDate}

Rules:
1. Handle relative terms:
   - "recent" = last 3 months
   - "last year" = full previous calendar year
   - "this week" = Monday to today
2. Recognize date formats:
   - "Q2 2023" → 2023-04-01 to 2023-06-30
   - "Spring 2022" → 2022-03-20 to 2022-06-20
3. If no clear date context, return null dates
4. Dates must be YYYY-MM-DD format
5. End date cannot be after current date

Return only valid JSON matching this TypeScript interface:
interface DateRangeResponse {
  dateRange: {
    startDate: string | null;  // YYYY-MM-DD
    endDate: string | null;    // YYYY-MM-DD
    rationale: string;
  };
  confidence: 'low' | 'medium' | 'high';
  temporalContext: {
    relativeTime?: 'recent' | 'historic' | 'specific_range';
    referencePoint?: 'conversation_history' | 'current_date' | 'explicit_query';
  };
}`,
        },
        {
          role: "user",
          content: `Query: ${query}${
            previousQueries.length
              ? "\nPrevious queries: " + previousQueries.join("\n")
              : ""
          }`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    const dateRange = JSON.parse(response) as DateRangeResponse;

    logger.log("=== Date Parser Response ===");
    logger.logObject("Date Range", dateRange);

    return NextResponse.json(dateRange);
  } catch (error) {
    logger.error("Date Parser Error:", error);
    return NextResponse.json(
      { error: "Failed to parse date range" },
      { status: 500 }
    );
  }
}
