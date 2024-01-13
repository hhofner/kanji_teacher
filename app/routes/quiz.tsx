import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { format, startOfWeek } from "date-fns";
import { eq, and } from "drizzle-orm";
import { useState } from "react";
import { db } from "~/drizzle/config.server";
import { kanji } from "~/drizzle/schema.server";
import { requireUser } from "~/session";
import { shuffle } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  const startDay = format(startOfWeek(new Date()), "MM/dd");
  const kanjis = await db
    .select()
    .from(kanji)
    .where(and(eq(kanji.date, startDay), eq(kanji.userId, user.id)));

  return { kanjis };
}
export default function QuizPage() {
  const { kanjis } = useLoaderData<typeof loader>();
  const [hasQuizStarted, setHasQuizStarted] = useState(false);

  // random list of indeces
  const [quizIndeces, setQuizIndeces] = useState(
    shuffle(Array.from(Array(kanjis.length).keys())),
  );
  const [answers, setAnswers] = useState<
    { index: string; answer: string; correct: boolean }[]
  >([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");

  function submitAnswer() {
    if (kanjis[quizIndeces[0]].meanings?.split(",").includes(currentAnswer)) {
      setAnswers([
        ...answers,
        {
          index: quizIndeces[0].toString(),
          answer: currentAnswer,
          correct: true,
        },
      ]);
    } else {
      setAnswers([
        ...answers,
        {
          index: quizIndeces[0].toString(),
          answer: currentAnswer,
          correct: false,
        },
      ]);
    }
    if (quizIndeces.length === 1) {
      setHasQuizStarted(false);
      setQuizIndeces(shuffle(Array.from(Array(kanjis.length).keys())));
      setCurrentAnswer("");
      return;
    }
    setCurrentAnswer("");
    setQuizIndeces(quizIndeces.slice(1));
  }

  return (
    <div className="flex flex-col items-center gap-8 h-full justify-between pt-24">
      {!hasQuizStarted && (
        <>
          <h1 className="text-6xl">Create a quiz</h1>
          {answers.length > 0 && (
            <div>
              <h2>
                Results {answers.filter((a) => a.correct).length}/
                {answers.length}{" "}
              </h2>
              {answers.map((answer, idx) => (
                <p
                  key={answer.answer + idx}
                  className={`${
                    answer.correct ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {kanjis[parseInt(answer.index)].character} - {answer.answer} -{" "}
                  {answer.correct ? "Correct" : "Incorrect"}
                </p>
              ))}
            </div>
          )}
          <button
            onClick={() => setHasQuizStarted(true)}
            className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800 transition-colors disabled:bg-gray-200"
          >
            Start →
          </button>
        </>
      )}
      {hasQuizStarted && (
        <>
          <h2 className="text-8xl">{kanjis[quizIndeces[0]].character}</h2>
          <div>
            <input
              type="text"
              name="answer"
              placeholder="Answer here"
              onChange={(e) => setCurrentAnswer(e.target.value)}
              value={currentAnswer}
            />
            <button onClick={() => submitAnswer()}>Submit</button>
          </div>
        </>
      )}
    </div>
  );
}
