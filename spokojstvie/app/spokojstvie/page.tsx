"use client";
import { useMemo, useState } from "react";
import {
  ArrowBullet,
  AutoTextarea,
  MoodScale,
  PageFooter,
  PillToggle,
  PrintButton,
  ProgressBar,
  ResetButton,
} from "../_components/primitives";
import { useChecklistState } from "../_components/useChecklistState";

// ── Уровни мышления (порядок: Дитя 0,3,6 / Подросток 1,4,7 / Взрослый 2,5,8)
const LEVEL_PHRASES = [
  "«Я думаю о том, что случится так, как будто это уже точно случится со мной, хотя исход ещё не очевиден.»",
  "«Когда мне страшно, я начинаю метаться, принимать резкие решения или делать хаотичные движения.»",
  "«Я могу остановиться и спросить себя: это реальная опасность или страх, который я сам(а) усилил(а)?»",
  "«Я пугаю себя мыслями о самом страшном и не могу переключиться.»",
  "«Я сопротивляюсь реальности, цепляюсь за старое и внутренне доказываю жизни, что всё должно быть по-моему.»",
  "«Я могу прожить страх, увидеть факты и только потом переходить к действиям.»",
  "«Когда мне страшно, я как будто замираю и перестаю видеть возможности.»",
  "«Я ставлю себе слишком большую цель, а потом быстро проваливаюсь в разочарование.»",
  "«Я готов(а) идти маленькими шагами для постепенного обретения спокойствия через конкретные действия.»",
];

const LOSING_LABELS = ["ясность", "спокойствие", "способность думать", "способность видеть возможности"] as const;

type DayEntry = { did: string; helped: string };

type State = {
  // p2 - Где я сейчас
  scaryScenario: string;
  scaryThought: string;
  bodyFear: string;
  whenScared: string;
  losing: boolean[];
  losingOther: string;

  // p3 - Уровни мышления
  levels: boolean[];
  currentLevel: string;
  toAdult: string;

  // p4 - Антиципация (шаги 1–6)
  worstScenario: string;
  worstDetail: string;
  bodyLocation: string;
  breath: string;
  muscles: string;
  extraSens: string;
  howEnter: string;
  intensified: string;
  peakMoment: string;
  afterPeak: string;
  exitBreath: string;
  exitMuscles: string;
  exitGeneral: string;
  afterPeakFeeling: string;
  lifeAfter: string;
  whereAfter: string;
  doingAfter: string;
  reliefAfter: string;
  smileAfter: string;
  mantra: string;
  whatChanged: string;

  // p5 - Какой исход я выбираю
  chosenOutcome: string;
  chosenWhere: string;
  chosenDoing: string;
  chosenRelief: string;
  chosenFeel: string;
  chosenPeace: string;

  // p6 - Факты vs страх
  facts: string;
  notFacts: string;
  realRisk: string;
  othersStories: string;
  realActions: string;

  // p7 - Мои опоры
  resources: string;
  pastCrises: string;
  whatHelped: string;
  pastExperience: string;
  support: string;

  // p8 - Маленькие шаги
  bigGoal: string;
  threeSteps: string;
  todayStep: string;
  howToMark: string;
  selfPraise: string;

  // p9 - Трекер (7 дней)
  days: DayEntry[];

  // p10 - Итог
  whatLearned: string;
  moodBefore: number | null;
  moodAfter: number | null;
  reminder: string;
};

const INITIAL: State = {
  scaryScenario: "",
  scaryThought: "",
  bodyFear: "",
  whenScared: "",
  losing: Array(4).fill(false),
  losingOther: "",

  levels: Array(9).fill(false),
  currentLevel: "",
  toAdult: "",

  worstScenario: "",
  worstDetail: "",
  bodyLocation: "",
  breath: "",
  muscles: "",
  extraSens: "",
  howEnter: "",
  intensified: "",
  peakMoment: "",
  afterPeak: "",
  exitBreath: "",
  exitMuscles: "",
  exitGeneral: "",
  afterPeakFeeling: "",
  lifeAfter: "",
  whereAfter: "",
  doingAfter: "",
  reliefAfter: "",
  smileAfter: "",
  mantra: "",
  whatChanged: "",

  chosenOutcome: "",
  chosenWhere: "",
  chosenDoing: "",
  chosenRelief: "",
  chosenFeel: "",
  chosenPeace: "",

  facts: "",
  notFacts: "",
  realRisk: "",
  othersStories: "",
  realActions: "",

  resources: "",
  pastCrises: "",
  whatHelped: "",
  pastExperience: "",
  support: "",

  bigGoal: "",
  threeSteps: "",
  todayStep: "",
  howToMark: "",
  selfPraise: "",

  days: Array(7).fill(null).map(() => ({ did: "", helped: "" })),

  whatLearned: "",
  moodBefore: null,
  moodAfter: null,
  reminder: "",
};

const REQUIRED_TEXT: (keyof State)[] = [
  "scaryScenario", "scaryThought", "currentLevel", "worstScenario",
  "facts", "resources", "bigGoal", "whatLearned", "reminder",
];
const TOTAL = 9;

export default function SpokojstviePage() {
  const { state, setState, update, reset } = useChecklistState<State>(
    "checklist:spokojstvie:v1",
    INITIAL,
  );
  const [navOpen, setNavOpen] = useState(false);

  const setLosing = (i: number, v: boolean) => {
    setState((prev) => {
      const losing = [...prev.losing]; losing[i] = v;
      return { ...prev, losing };
    });
  };
  const setLevel = (i: number, v: boolean) => {
    setState((prev) => {
      const levels = [...prev.levels]; levels[i] = v;
      return { ...prev, levels };
    });
  };
  const setDay = (i: number, key: keyof DayEntry, v: string) => {
    setState((prev) => {
      const days = prev.days.map((d, idx) => idx === i ? { ...d, [key]: v } : d);
      return { ...prev, days };
    });
  };

  const childCount = [0, 3, 6].filter((i) => state.levels[i]).length;
  const teenCount  = [1, 4, 7].filter((i) => state.levels[i]).length;
  const adultCount = [2, 5, 8].filter((i) => state.levels[i]).length;

  const progress = useMemo(() => {
    const textDone = REQUIRED_TEXT.reduce(
      (s, k) => s + (typeof state[k] === "string" && (state[k] as string).trim() ? 1 : 0), 0,
    );
    const levDone  = state.levels.some(Boolean) ? 1 : 0;
    const dayDone  = state.days.some((d) => d.did.trim()) ? 1 : 0;
    const beforeD  = state.moodBefore ? 1 : 0;
    const afterD   = state.moodAfter ? 1 : 0;
    const total    = REQUIRED_TEXT.length + 4;
    return Math.round(((textDone + levDone + dayDone + beforeD + afterD) / total) * 100);
  }, [state]);

  return (
    <>
      <NavBar progress={progress} open={navOpen} setOpen={setNavOpen} />
      <main className="paper-page">
        <CoverPage />

        <div className="guide-card no-print">
          <div>
            <div className="guide-kicker sans">Как проходить</div>
            <h2>Идите сверху вниз. Сайт сам сохраняет ответы.</h2>
          </div>
          <p>
            Не нужно заполнять идеально. Достаточно честно записывать то, что есть сейчас:
            состояние, телесные ощущения, факты, опоры и один следующий шаг.
          </p>
          <a href="#p2" className="guide-button sans">Начать с текущего состояния</a>
        </div>

        {/* ── СЕКЦИЯ 1: Где я сейчас ─────────────────────── */}
        <section id="p2" className="section">
          <h2 className="h1">Где я сейчас</h2>
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Зафиксируйте текущее состояние.
          </p>

          <Field label="Ситуация, которая меня пугает:" value={state.scaryScenario} onChange={(v) => update("scaryScenario", v)} rows={2} />
          <Field label="Моя самая страшная мысль в этой ситуации:" value={state.scaryThought} onChange={(v) => update("scaryThought", v)} rows={2} />
          <Field label="Где в теле я чувствую этот страх в первую очередь:" value={state.bodyFear} onChange={(v) => update("bodyFear", v)} rows={2} />
          <Field label="Что я обычно делаю, когда мне страшно:" value={state.whenScared} onChange={(v) => update("whenScared", v)} rows={2} />

          <div className="field-row" style={{ marginTop: "24px" }}>
            <div className="flex items-start gap-3 mb-4">
              <ArrowBullet />
              <div className="h2">Что я начинаю терять в этом состоянии:</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {LOSING_LABELS.map((label, i) => (
                <PillToggle key={i} active={state.losing[i]} onChange={(v) => setLosing(i, v)}>
                  {label}
                </PillToggle>
              ))}
            </div>
          </div>
          <Field label="Другое:" value={state.losingOther} onChange={(v) => update("losingOther", v)} rows={2} />

          <PageFooter index={1} total={TOTAL} />
        </section>

        {/* ── СЕКЦИЯ 2: Как я проживаю страх ──────────────── */}
        <section id="p3" className="section">
          <h2 className="h1">Как я проживаю страх</h2>
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Отметьте галочкой те фразы, которые больше всего похожи на вас сейчас:
          </p>

          <LevelGroup pill="Уровень «Дитя»"      indices={[0, 3, 6]} levels={state.levels} setLevel={setLevel} />
          <LevelGroup pill="Уровень «Подросток»"  indices={[1, 4, 7]} levels={state.levels} setLevel={setLevel} />
          <LevelGroup pill="Уровень «Взрослый»"   indices={[2, 5, 8]} levels={state.levels} setLevel={setLevel} />

          {state.levels.some(Boolean) && (
            <div className="bars-row mt-6">
              {[
                { label: "Дитя",      count: childCount, color: "var(--c-purple)" },
                { label: "Подросток", count: teenCount,  color: "var(--c-gold)" },
                { label: "Взрослый",  count: adultCount, color: "#2E9E6E" },
              ].map(({ label, count, color }) => (
                <div key={label} className="bar-col">
                  <div className="bar-label sans">{label}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ "--bar-color": color, "--bar-height": `${Math.round((count / 3) * 100)}%` } as React.CSSProperties} />
                  </div>
                  <div className="bar-count sans">{count} / 3</div>
                </div>
              ))}
            </div>
          )}

          <Field label="Мой текущий уровень мышления в этой ситуации:" value={state.currentLevel} onChange={(v) => update("currentLevel", v)} rows={3} />
          <Field label="Что поможет мне перейти на уровень Взрослого уже сейчас?" value={state.toAdult} onChange={(v) => update("toAdult", v)} rows={3} />
          <PageFooter index={2} total={TOTAL} />
        </section>

        {/* ── СЕКЦИЯ 3: Антиципация ────────────────────────── */}
        <section id="p4" className="section">
          <h2 className="h1">Антиципация: прожить страх телом</h2>
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Не анализируйте страх - проживите его телом. Не «крутите кино в голове» и не
            визуализируйте, а позволяйте себе почувствовать страх максимально сильно, чтобы
            мозг зафиксировал: «это уже случилось».
          </p>

          {/* Шаг 1 */}
          <StepBlock n={1} title="Назвать самый страшный сценарий">
            <Field label="Самое страшное, что я себе представляю в этой ситуации (одной фразой):" value={state.worstScenario} onChange={(v) => update("worstScenario", v)} rows={1} />
            <Field label="Если описать этот сценарий чуть подробнее (2–3 предложения):" value={state.worstDetail} onChange={(v) => update("worstDetail", v)} rows={3} />
          </StepBlock>

          {/* Шаг 2 */}
          <StepBlock n={2} title="Заметить, как страх проявляется в теле">
            <Field label="Где в теле я чувствую этот страх сильнее всего:" value={state.bodyLocation} onChange={(v) => update("bodyLocation", v)} rows={2} />
            <p className="italic" style={{ color: "var(--c-muted)", fontSize: "15px", margin: "12px 0 4px" }}>
              Что происходит с телом, когда я начинаю думать об этом сценарии:
            </p>
            <Field label="Дыхание (замирает / учащается / перехватывает / становится поверхностным):" value={state.breath} onChange={(v) => update("breath", v)} rows={1} />
            <Field label="Мышцы (напряжение в шее / спине / руках / ногах / челюсти):" value={state.muscles} onChange={(v) => update("muscles", v)} rows={1} />
            <Field label="Дополнительные ощущения (дрожь, жар, холод, мурашки, слёзы, онемение и т.п.):" value={state.extraSens} onChange={(v) => update("extraSens", v)} rows={2} />
          </StepBlock>

          {/* Шаг 3 */}
          <StepBlock n={3} title="Войти в страх и довести до пика">
            <p className="italic" style={{ color: "var(--c-muted)", fontSize: "15px", margin: "0 0 12px" }}>
              Сейчас не нужно отгонять эти ощущения. Дайте себе несколько минут, чтобы «зайти» в этот страх полностью.
            </p>
            <Field label="Что я делаю, чтобы войти в этот страх глубже (где я, как сижу/лежу, закрываю ли глаза):" value={state.howEnter} onChange={(v) => update("howEnter", v)} rows={2} />
            <Field label="Какие ощущения усиливаются, когда я позволяю страху «накрыть» меня сильнее:" value={state.intensified} onChange={(v) => update("intensified", v)} rows={2} />
            <Field label="Момент пика: как я понимаю, что страх достиг максимума?" value={state.peakMoment} onChange={(v) => update("peakMoment", v)} rows={2} />
            <Field label="Что происходит, если я не прерываю этот пик, а остаюсь в ощущениях до конца:" value={state.afterPeak} onChange={(v) => update("afterPeak", v)} rows={2} />
          </StepBlock>

          {/* Шаг 4 */}
          <StepBlock n={4} title="Замечать, как страх проходит">
            <p className="italic" style={{ color: "var(--c-muted)", fontSize: "15px", margin: "0 0 12px" }}>
              Отследите момент, когда тело само начинает выходить из этого состояния.
            </p>
            <p className="label" style={{ marginBottom: "8px" }}>Какие признаки говорят, что пик страха прошёл:</p>
            <Field label="Дыхание (становится глубже / ровнее):" value={state.exitBreath} onChange={(v) => update("exitBreath", v)} rows={1} />
            <Field label="Мышцы (напряжение уменьшается / отпускает):" value={state.exitMuscles} onChange={(v) => update("exitMuscles", v)} rows={1} />
            <Field label="Общие ощущения (тепло, усталость, пустота, облегчение и т.п.):" value={state.exitGeneral} onChange={(v) => update("exitGeneral", v)} rows={2} />
            <Field label="Как я себя чувствую сразу после пика (двумя-тремя словами):" value={state.afterPeakFeeling} onChange={(v) => update("afterPeakFeeling", v)} rows={1} />
          </StepBlock>

          {/* Шаг 5 */}
          <StepBlock n={5} title="Исход, который вызывает радость">
            <p className="italic" style={{ color: "var(--c-muted)", fontSize: "15px", margin: "0 0 12px" }}>
              Этот образ должен вызвать не только лёгкость, но и внутреннюю улыбку, радость.
            </p>
            <Field label="Как выглядит моя жизнь «после» - когда страшный сценарий уже случился, а я живу дальше:" value={state.lifeAfter} onChange={(v) => update("lifeAfter", v)} rows={3} />
            <Field label="Где я живу / как живу после того, как самое страшное уже произошло:" value={state.whereAfter} onChange={(v) => update("whereAfter", v)} rows={2} />
            <Field label="Чем я занимаюсь, чем наполнена моя жизнь:" value={state.doingAfter} onChange={(v) => update("doingAfter", v)} rows={2} />
            <Field label="Что теперь, после того как всё произошло, приносит мне облегчение или радость:" value={state.reliefAfter} onChange={(v) => update("reliefAfter", v)} rows={2} />
            <Field label="В какой момент у меня появляется улыбка или ощущение «я живу дальше, жизнь продолжается»:" value={state.smileAfter} onChange={(v) => update("smileAfter", v)} rows={2} />
            <Field label="Моя фраза в этом состоянии (как внутренний тост / мантра):" value={state.mantra} onChange={(v) => update("mantra", v)} rows={1} />
          </StepBlock>

          {/* Шаг 6 */}
          <StepBlock n={6} title="Фиксация: эпизод завершён">
            <div className="quote-card" style={{ borderColor: "var(--c-gold)", background: "#fff" }}>
              <div className="flex items-start gap-3">
                <ArrowBullet />
                <div className="italic">
                  «Этот страх я уже прожил(а) телом. История прожита. Я могу жить дальше и видеть новые возможности.»
                </div>
              </div>
            </div>
            <Field label="Что во мне изменилось после этого шага (даже если немного):" value={state.whatChanged} onChange={(v) => update("whatChanged", v)} rows={3} />
          </StepBlock>

          <PageFooter index={3} total={TOTAL} />
        </section>

        {/* ── СЕКЦИЯ 4: Какой исход я выбираю ─────────────── */}
        <section id="p5" className="section">
          <h2 className="h1">Какой исход я выбираю</h2>
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            После проживания страха зафиксируйте то состояние, в котором вы уже прошли
            через этот сценарий и продолжаете жить дальше.
          </p>
          <Field label="Если самое страшное уже случилось, как выглядит моя жизнь дальше:" value={state.chosenOutcome} onChange={(v) => update("chosenOutcome", v)} rows={3} />
          <Field label="Где я нахожусь / как живу:" value={state.chosenWhere} onChange={(v) => update("chosenWhere", v)} rows={2} />
          <Field label="Чем я занимаюсь дальше:" value={state.chosenDoing} onChange={(v) => update("chosenDoing", v)} rows={2} />
          <Field label="На что я могу опереться даже в этом сценарии:" value={state.chosenRelief} onChange={(v) => update("chosenRelief", v)} rows={2} />
          <Field label="Что я чувствую, когда представляю этот исход до конца:" value={state.chosenFeel} onChange={(v) => update("chosenFeel", v)} rows={2} />
          <Field label="В какой момент внутри появляется облегчение, тепло или спокойствие:" value={state.chosenPeace} onChange={(v) => update("chosenPeace", v)} rows={2} />
          <PageFooter index={4} total={TOTAL} />
        </section>

        {/* ── СЕКЦИЯ 5: Рациональный и иррациональный страх ── */}
        <section id="p6" className="section">
          <h2 className="h1">Рациональный и иррациональный страх</h2>
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Посмотрите на ситуацию глазами взрослого и разделите: где есть факты, а где страх
            дорисовывает лишнее.
          </p>
          <Field label="Что в моей ситуации является фактом:" value={state.facts} onChange={(v) => update("facts", v)} rows={3} />
          <Field label="Что из моего страха пока не подтверждается фактами:" value={state.notFacts} onChange={(v) => update("notFacts", v)} rows={3} />
          <Field label="Какой риск действительно касается меня:" value={state.realRisk} onChange={(v) => update("realRisk", v)} rows={2} />
          <Field label="Что я сейчас примеряю на себя из чужих историй, новостей или общего фона:" value={state.othersStories} onChange={(v) => update("othersStories", v)} rows={2} />
          <Field label="Какие реальные действия нужны в моей ситуации, если смотреть на неё без паники:" value={state.realActions} onChange={(v) => update("realActions", v)} rows={3} />
          <PageFooter index={5} total={TOTAL} />
        </section>

        {/* ── СЕКЦИЯ 6: Мои опоры ──────────────────────────── */}
        <section id="p7" className="section">
          <h2 className="h1">Мои опоры</h2>
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Зафиксируйте, на что вы уже можете опереться в этой ситуации.
          </p>
          <Field label="Какие ресурсы у меня есть сейчас:" value={state.resources} onChange={(v) => update("resources", v)} rows={3} />
          <Field label="Какие кризисы я уже проходил(а) раньше:" value={state.pastCrises} onChange={(v) => update("pastCrises", v)} rows={3} />
          <Field label="Что тогда помогло мне справиться:" value={state.whatHelped} onChange={(v) => update("whatHelped", v)} rows={2} />
          <Field label="Какой свой прошлый опыт я могу вспомнить как доказательство: «я уже умею проходить сложные периоды»:" value={state.pastExperience} onChange={(v) => update("pastExperience", v)} rows={3} />
          <Field label="Кто или что может быть моей опорой сейчас:" value={state.support} onChange={(v) => update("support", v)} rows={2} />
          <PageFooter index={6} total={TOTAL} />
        </section>

        {/* ── СЕКЦИЯ 7: Маленькие шаги ─────────────────────── */}
        <section id="p8" className="section">
          <h2 className="h1">Маленькие шаги из спокойствия</h2>
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            После проживания страха переходите к действиям - маленьким шагам, которые
            возвращают ощущение управления ситуацией.
          </p>
          <Field label="Моя большая цель в этой ситуации:" value={state.bigGoal} onChange={(v) => update("bigGoal", v)} rows={2} />
          <Field label="Какие три маленьких шага я могу сделать в ближайшие 7 дней:" value={state.threeSteps} onChange={(v) => update("threeSteps", v)} rows={3} />
          <Field label="Какой один шаг я могу сделать уже сегодня:" value={state.todayStep} onChange={(v) => update("todayStep", v)} rows={2} />
          <Field label="Как я отмечу для себя, что этот шаг сделан:" value={state.howToMark} onChange={(v) => update("howToMark", v)} rows={2} />
          <Field label="За что я могу себя похвалить уже сейчас:" value={state.selfPraise} onChange={(v) => update("selfPraise", v)} rows={2} />
          <PageFooter index={7} total={TOTAL} />
        </section>

        {/* ── СЕКЦИЯ 8: Ежедневный трекер ─────────────────── */}
        <section id="p9" className="section">
          <h2 className="h1">Ежедневный трекер спокойствия</h2>
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            В течение недели каждый вечер фиксируйте, что вы сделали и что помогло вам
            сохранить или вернуть спокойствие.
          </p>
          <div className="grid-2col mt-6">
            {state.days.map((day, i) => (
              <div
                key={i}
                style={{
                  background: i % 2 === 0 ? "var(--c-purple-soft)" : "#fff",
                  border: "1px solid var(--c-purple-line)",
                  borderRadius: "14px",
                  padding: "18px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span className="num-circle">{i + 1}</span>
                  <span style={{ fontWeight: 600, color: "var(--c-purple-deep)" }}>День {i + 1}</span>
                </div>
                <div className="field-row" style={{ margin: "0 0 8px" }}>
                  <label className="label" style={{ fontSize: "14px" }}>Что я сегодня сделал(а):</label>
                  <AutoTextarea value={day.did} onChange={(v) => setDay(i, "did", v)} minRows={2} />
                </div>
                <div className="field-row" style={{ margin: 0 }}>
                  <label className="label" style={{ fontSize: "14px" }}>Что помогло мне вернуть спокойствие:</label>
                  <AutoTextarea value={day.helped} onChange={(v) => setDay(i, "helped", v)} minRows={2} />
                </div>
              </div>
            ))}
          </div>
          <PageFooter index={8} total={TOTAL} />
        </section>

        {/* ── СЕКЦИЯ 9: Итог ───────────────────────────────── */}
        <section id="p10" className="section">
          <h2 className="h1">Что я понял(а) о своём страхе</h2>
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Зафиксируйте итог после прохождения техники.
          </p>
          <Field label="Что я понял(а) о своём страхе после прохождения этой техники:" value={state.whatLearned} onChange={(v) => update("whatLearned", v)} rows={4} />

          <div className="flex items-start gap-3 mt-8 mb-3">
            <ArrowBullet />
            <div className="h2">Как изменилось моё состояние по шкале от 1 до 10:</div>
          </div>

          <div className="state-change-card">
            <div className="state-scale-block">
              <div className="label">До выполнения чек-листа:</div>
              <MoodScale value={state.moodBefore} onChange={(v) => update("moodBefore", v)} mode="before" />
            </div>
            <div className="state-scale-block">
              <div className="label">После выполнения чек-листа:</div>
              <MoodScale value={state.moodAfter} onChange={(v) => update("moodAfter", v)} mode="after" />
            </div>
          </div>

          <Field label="Какую мысль я хочу запомнить как напоминание на случай, если ситуация повторится:" value={state.reminder} onChange={(v) => update("reminder", v)} rows={3} />

          <div className="quote-card mt-10" style={{ borderColor: "var(--c-gold)", background: "#fff" }}>
            <div className="flex items-start gap-3">
              <ArrowBullet />
              <div>
                Этот чек-лист - один из инструментов возвращения спокойствия. Чтобы глубже
                разобраться в своих жизненных сценариях и способах реагирования, читайте книгу
                Натальи Батаевой «На Личность идёт НаЛичность» или проходите онлайн-курс.
              </div>
            </div>
          </div>

          <div className="cta-buttons no-print">
            <a href="https://na-lichnost.ru/book" target="_blank" rel="noopener noreferrer" className="cta-btn cta-btn--book">
              Книга «На Личность идёт НаЛичность»
            </a>
            <a href="https://na-lichnost.ru/" target="_blank" rel="noopener noreferrer" className="cta-btn cta-btn--course">
              Онлайн-курс
            </a>
          </div>

          <div className="final-actions no-print">
            <PrintButton />
            <ResetButton onReset={reset} />
          </div>

          <PageFooter index={9} total={TOTAL} />
        </section>
      </main>
    </>
  );
}

// ──────────────────────────────────────────────
// Компоненты
// ──────────────────────────────────────────────

function NavBar({ progress, open, setOpen }: { progress: number; open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <nav className="top-dock no-print">
      <div className="top-dock-inner">
        <div className="top-dock-head sans">
          <a href="#p1" className="toc-link brand-link">Техника спокойствия</a>
          <div className="top-dock-actions">
            <span>{progress}% заполнено</span>
            <button
              type="button"
              className="menu-toggle"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
        <ProgressBar value={progress} />
        <div className="section-tabs" data-open={open}>
          <a href="#p2"  className="toc-link" onClick={() => setOpen(false)}>Сейчас</a>
          <a href="#p3"  className="toc-link" onClick={() => setOpen(false)}>Тест</a>
          <a href="#p4"  className="toc-link" onClick={() => setOpen(false)}>Антиципация</a>
          <a href="#p5"  className="toc-link" onClick={() => setOpen(false)}>Исход</a>
          <a href="#p6"  className="toc-link" onClick={() => setOpen(false)}>Факты</a>
          <a href="#p7"  className="toc-link" onClick={() => setOpen(false)}>Опоры</a>
          <a href="#p8"  className="toc-link" onClick={() => setOpen(false)}>Шаги</a>
          <a href="#p9"  className="toc-link" onClick={() => setOpen(false)}>Трекер</a>
          <a href="#p10" className="toc-link" onClick={() => setOpen(false)}>Итог</a>
        </div>
      </div>
    </nav>
  );
}

function CoverPage() {
  return (
    <section
      id="p1"
      className="cover-page rounded-2xl overflow-hidden mb-10"
      style={{
        background: "radial-gradient(ellipse at 30% 20%, #5e2a91 0%, #3b1768 55%, #2a0e52 100%)",
        color: "#fff",
        padding: "60px 40px",
        textAlign: "center",
      }}
    >
      <div className="mb-7" style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo-nalich.png`}
          alt="НаЛичность"
          className="cover-logo"
        />
      </div>
      <div style={{ marginBottom: "20px", marginTop: "36px" }}>
        <span className="pill-gold" style={{ fontSize: "20px", padding: "10px 32px" }}>
          «Чек-лист»
        </span>
      </div>
      <h1
        style={{
          fontFamily: "var(--font-forum), serif",
          fontSize: "clamp(36px, 5vw, 54px)",
          lineHeight: 1.05,
          fontWeight: 400,
          margin: "0",
          maxWidth: "720px",
          marginInline: "auto",
        }}
      >
        «Техника возвращения спокойствия»
      </h1>
      <p
        className="sans mt-4 opacity-80"
        style={{ fontSize: "18px", maxWidth: "36rem", margin: "1rem auto 0" }}
      >
        Этот чек-лист поможет вам пройти через страх потери, вернуть ясность и увидеть
        возможности, чтобы не принимать решения в состоянии паники.
      </p>
      <p className="sans italic mt-12 opacity-80">
        <a href="https://na-lichnost.ru/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
          @MethodBataeva
        </a>
      </p>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="field-row">
      <label className="label">{label}</label>
      <AutoTextarea
        value={value}
        onChange={onChange}
        minRows={rows}
        className={rows === 1 ? "field-input field-input-single" : "field-input field-input-multi"}
      />
    </div>
  );
}

function StepBlock({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="num-circle">{n}</span>
        <span className="h2">{title}</span>
      </div>
      <div style={{
        paddingLeft: "4px",
        borderLeft: "2px solid var(--c-purple-line)",
        marginLeft: "18px",
        paddingBottom: "4px",
      }}>
        {children}
      </div>
    </div>
  );
}

function LevelGroup({
  pill,
  indices,
  levels,
  setLevel,
}: {
  pill: string;
  indices: number[];
  levels: boolean[];
  setLevel: (i: number, v: boolean) => void;
}) {
  return (
    <div className="mt-7">
      <div className="mb-3">
        <span className="pill-gold">{pill}</span>
      </div>
      <div className="grid gap-1">
        {indices.map((idx) => (
          <button
            key={idx}
            type="button"
            className="level-option flex items-center gap-3 text-left w-full py-2"
            onClick={() => setLevel(idx, !levels[idx])}
          >
            <span className="radio-circle" data-checked={levels[idx]}>
              <span className="radio-inner" />
            </span>
            <span className="level-option-text flex-1">{LEVEL_PHRASES[idx]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
