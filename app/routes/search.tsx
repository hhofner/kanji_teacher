import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useFetcher } from "@remix-run/react";
import { type action as kanjiAddAction } from "./api.kanji.add";
import { useState } from "react";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const query = formData.get('q')
  if (!query) {
    // throw Error
  } else {
    const results = await fetch(`https://kanjiapi.dev/v1/kanji/${query}`)
    const kanjiInfo = await results.json()

    if (kanjiInfo && results.status === 200) {
      return kanjiInfo
    } else {
      return json({ error: results.statusText }, 404)
    }
  }
  return json({ error: "Bad request" }, 400)
}

export default function Search() {
  const actionData = useActionData<typeof action>()
  const fetcher = useFetcher<typeof kanjiAddAction>()
  const [addedKanjis, setAddedKanjis] = useState<string[]>([])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        {addedKanjis.map((kanji) => <p key={kanji}>{kanji}</p>)}
      </div>
      <Form className="flex flex-col gap-4" method="post">
        <div className="flex gap-2 items-center">
          <input name="q" type="search" className="w-full border rounded border-blue-400" />
          <button type="submit">Search</button>
        </div>
      </Form>
      <div>
        {actionData?.kanji && (
          <fetcher.Form className="flex justify-between items-center" method="post" action="/api/kanji/add">
            <div className="flex flex-col gap-1">
              <p className="text-3xl">{actionData.kanji}</p>
              <small>{actionData?.meanings && actionData.meanings[0]}</small>
            </div>
            <button onClick={() => setAddedKanjis([...addedKanjis, actionData?.kanji])} value={actionData.kanji} name="kanji" className="bg-blue-500 rounded p-1 h-fit text-white">Add</button>
          </fetcher.Form>
        )}
      </div>
    </div>)
}
