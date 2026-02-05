import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/utils/server/urls";
import { getOboToken } from "@/utils/server/getOboToken";
import { headers } from "next/headers";

const retrieveSourceApiUrl = (request: NextRequest) => {
  const proxyUrl = new URL(apiUrl);
  const requestUrl = new URL(request.url.replace("/api/proxy", ""));
  return new URL(requestUrl.pathname + requestUrl.search, proxyUrl);
};

async function fetchFromApi(request: NextRequest, targetUrl: URL) {
  const headersList = await headers();
  const authToken = headersList.get("x-auth-token") || "";
  const oboToken = await getOboToken(authToken);

  const method = request.method;
  const body =
    method !== "GET" && method !== "HEAD" ? await request.text() : undefined;

  const requestInit: RequestInit = {
    body,
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${oboToken}`,
    },
    // @ts-expect-error - This is a valid option for duplex streaming
    duplex: body ? "half" : undefined,
  };

  const response = await fetch(targetUrl.href, requestInit);

  if (!response.ok) {
    console.log(
      `Failed to fetch data from api ${targetUrl.href} status text: ${response.statusText} and status code: ${response.status}`,
    );

    return new NextResponse(JSON.stringify({}), {
      status: response.status,
      headers: response.headers,
    });
  }

  const jsonData = await response.text();
  return new NextResponse(jsonData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const proxyUrl = retrieveSourceApiUrl(request);
  return fetchFromApi(request, proxyUrl);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const proxyUrl = retrieveSourceApiUrl(request);
  return fetchFromApi(request, proxyUrl);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const proxyUrl = retrieveSourceApiUrl(request);
  return fetchFromApi(request, proxyUrl);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const proxyUrl = retrieveSourceApiUrl(request);
  return fetchFromApi(request, proxyUrl);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const proxyUrl = retrieveSourceApiUrl(request);
  return fetchFromApi(request, proxyUrl);
}
