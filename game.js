(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const comboEl = document.getElementById("combo");
  const cleanEl = document.getElementById("clean");
  const roundState = document.getElementById("roundState");
  const startOverlay = document.getElementById("startOverlay");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const overlayStartBtn = document.getElementById("overlayStartBtn");
  const modeButtons = Array.from(document.querySelectorAll("[data-mode]"));
  const weaponButtons = Array.from(document.querySelectorAll("[data-weapon]"));

  const PAUSE_ICON = '<path d="M7 5h4v14H7zM13 5h4v14h-4z" />';
  const PLAY_ICON = '<path d="M8 5v14l11-7z" />';
  const MODE_ORDER = ["code", "math", "english"];
  const WEAPON_ORDER = ["water", "fire", "ice", "laser"];
  const WEAPONS = {
    water: {
      label: "水枪",
      rangeBase: 350,
      rangeBoost: 460,
      minRange: 86,
      rangeLead: 26,
      damageBase: 150,
      damageBoost: 300,
      widthBase: 6,
      widthBoost: 5,
      widthFar: 4,
      hitScale: 0.32,
      hitBonus: 6,
      impactRate: 4.6,
      popAt: 0.62,
      recoil: 4.5,
      main: "#34d1bf",
      core: "#e7fff8",
      glow: "rgba(121, 232, 255, 0.22)",
      side: "rgba(121, 232, 255, 0.72)",
      end: "rgba(52, 209, 191, 0)",
      bodyA: "#f6c85f",
      bodyB: "#ffe28a",
      bodyC: "#d89545",
      tankA: "#185966",
      tankB: "#0f2f38",
      puff: "#d7fff4",
    },
    fire: {
      label: "火枪",
      rangeBase: 260,
      rangeBoost: 320,
      minRange: 78,
      rangeLead: 34,
      damageBase: 230,
      damageBoost: 390,
      widthBase: 14,
      widthBoost: 15,
      widthFar: 18,
      hitScale: 0.45,
      hitBonus: 3,
      impactRate: 5.2,
      popAt: 0.72,
      recoil: 6.6,
      main: "#ff7b5f",
      core: "#fff2a8",
      glow: "rgba(255, 123, 95, 0.27)",
      side: "rgba(255, 177, 78, 0.78)",
      end: "rgba(255, 92, 55, 0)",
      bodyA: "#ff7b5f",
      bodyB: "#ffb14e",
      bodyC: "#9f2f23",
      tankA: "#5c2018",
      tankB: "#23110d",
      puff: "#ffb14e",
    },
    ice: {
      label: "冰枪",
      rangeBase: 320,
      rangeBoost: 400,
      minRange: 88,
      rangeLead: 28,
      damageBase: 118,
      damageBoost: 250,
      widthBase: 10,
      widthBoost: 9,
      widthFar: 8,
      hitScale: 0.4,
      hitBonus: 4,
      impactRate: 4.0,
      popAt: 0.58,
      recoil: 3.8,
      main: "#9ae8ff",
      core: "#f5fdff",
      glow: "rgba(154, 232, 255, 0.24)",
      side: "rgba(188, 248, 255, 0.74)",
      end: "rgba(154, 232, 255, 0)",
      bodyA: "#9ae8ff",
      bodyB: "#e7fff8",
      bodyC: "#3e98ba",
      tankA: "#153f58",
      tankB: "#0b1c2b",
      puff: "#e7fff8",
    },
    laser: {
      label: "激光枪",
      rangeBase: 440,
      rangeBoost: 520,
      minRange: 120,
      rangeLead: 18,
      damageBase: 260,
      damageBoost: 520,
      widthBase: 2.8,
      widthBoost: 2.2,
      widthFar: 1.4,
      hitScale: 0.22,
      hitBonus: 2.5,
      impactRate: 7.4,
      popAt: 0.75,
      recoil: 2.4,
      main: "#d47cff",
      core: "#ffffff",
      glow: "rgba(212, 124, 255, 0.25)",
      side: "rgba(121, 232, 255, 0.82)",
      end: "rgba(212, 124, 255, 0)",
      bodyA: "#d47cff",
      bodyB: "#79e8ff",
      bodyC: "#6534c9",
      tankA: "#311c5f",
      tankB: "#12091e",
      puff: "#f5ddff",
    },
  };

  const CODE_SNIPPETS = [
    {
      title: "examples/runner/main.go",
      lines: [
        "type chatRuntime struct {",
        "  runner runner.Runner",
        "  userID string",
        "  sessionID string",
        "  modelName string",
        "  streaming bool",
        "}",
        "",
        "func (c *chatRuntime) ask(ctx context.Context, text string) error {",
        "  msg := model.NewUserMessage(text)",
        "  reqID := fmt.Sprintf(\"wash-%d\", time.Now().UnixNano())",
        "  stream, err := c.runner.Run(ctx, c.userID, c.sessionID, msg,",
        "    agent.WithRequestID(reqID),",
        "  )",
        "  if err != nil {",
        "    return fmt.Errorf(\"run agent: %w\", err)",
        "  }",
        "  return c.readStream(stream)",
        "}",
      ],
    },
    {
      title: "agent/llmagent/setup.go",
      lines: [
        "func newAssistant(modelName string, tools []tool.Tool) agent.Agent {",
        "  llm := openai.New(modelName)",
        "  cfg := model.GenerationConfig{",
        "    MaxTokens: intPtr(2000),",
        "    Temperature: floatPtr(0.7),",
        "    Stream: true,",
        "  }",
        "  return llmagent.New(",
        "    \"chat-assistant\",",
        "    llmagent.WithModel(llm),",
        "    llmagent.WithTools(tools),",
        "    llmagent.WithGenerationConfig(cfg),",
        "    llmagent.WithInstruction(\"use tools when useful\"),",
        "    llmagent.WithEnableParallelTools(true),",
        "  )",
        "}",
      ],
    },
    {
      title: "examples/graph/basic.go",
      lines: [
        "func buildDocumentGraph(",
        "  llm model.Model,",
        "  tools map[string]tool.Tool,",
        ") (*graph.Graph, error) {",
        "  schema := graph.MessagesStateSchema()",
        "  stateGraph := graph.NewStateGraph(schema)",
        "  stateGraph.",
        "    AddNode(\"preprocess\", preprocessDocument).",
        "    AddLLMNode(\"analyze\", llm, analyzePrompt, tools).",
        "    AddToolsNode(\"tools\", tools).",
        "    AddNode(\"route_complexity\", routeComplexity).",
        "    AddLLMNode(\"summarize\", llm, summaryPrompt, nil).",
        "    AddNode(\"format_output\", formatOutput).",
        "    SetEntryPoint(\"preprocess\").",
        "    SetFinishPoint(\"format_output\")",
        "  stateGraph.AddEdge(\"preprocess\", \"analyze\")",
        "  return stateGraph.Compile()",
        "}",
      ],
    },
    {
      title: "memory/simple/main.go",
      lines: [
        "func wireMemory(ctx context.Context, kind string) (*runtime, error) {",
        "  memorySvc, err := util.NewMemoryServiceByType(",
        "    util.MemoryType(kind),",
        "    util.MemoryServiceConfig{SoftDelete: true},",
        "  )",
        "  if err != nil {",
        "    return nil, fmt.Errorf(\"memory service: %w\", err)",
        "  }",
        "  agent := llmagent.New(",
        "    \"memory-assistant\",",
        "    llmagent.WithModel(openai.New(\"deepseek-v4-flash\")),",
        "    llmagent.WithTools(memorySvc.Tools()),",
        "  )",
        "  run := runner.NewRunner(\"memory-chat\", agent,",
        "    runner.WithMemoryService(memorySvc),",
        "    runner.WithSessionService(inmemory.NewSessionService()),",
        "  )",
        "  return &runtime{runner: run, memory: memorySvc}, nil",
        "}",
      ],
    },
    {
      title: "tool/function/calculator.go",
      lines: [
        "func registerTools(clock Clock) []tool.Tool {",
        "  calculator := function.NewFunctionTool(",
        "    calculate,",
        "    function.WithName(\"calculator\"),",
        "    function.WithDescription(\"safe math operations\"),",
        "  )",
        "  now := function.NewFunctionTool(",
        "    clock.CurrentTime,",
        "    function.WithName(\"current_time\"),",
        "    function.WithDescription(\"timezone aware time lookup\"),",
        "  )",
        "  return []tool.Tool{calculator, now}",
        "}",
        "",
        "func calculate(args CalcArgs) (CalcResult, error) {",
        "  if args.Operation == \"divide\" && args.Right == 0 {",
        "    return CalcResult{}, errors.New(\"divide by zero\")",
        "  }",
        "  return eval(args), nil",
        "}",
      ],
    },
    {
      title: "tool/mcp/streamable.go",
      lines: [
        "func openMCPTools(ctx context.Context) (*mcp.ToolSet, error) {",
        "  set := mcp.NewMCPToolSet(",
        "    mcp.ConnectionConfig{",
        "      Transport: \"streamable_http\",",
        "      ServerURL: \"http://localhost:3000/mcp\",",
        "      Timeout: 10 * time.Second,",
        "    },",
        "    mcp.WithToolFilterFunc(",
        "      tool.NewIncludeToolNamesFilter(\"get_weather\", \"get_news\"),",
        "    ),",
        "  )",
        "  if err := set.Init(ctx); err != nil {",
        "    return nil, fmt.Errorf(\"init mcp toolset: %w\", err)",
        "  }",
        "  return set, nil",
        "}",
      ],
    },
    {
      title: "session/session.go",
      lines: [
        "func (sess *Session) AppendEvent(evt event.Event) {",
        "  sess.EventMu.Lock()",
        "  defer sess.EventMu.Unlock()",
        "  sess.Events = append(sess.Events, evt)",
        "  if len(evt.StateDelta) == 0 {",
        "    return",
        "  }",
        "  if sess.State == nil {",
        "    sess.State = StateMap{}",
        "  }",
        "  for key, value := range evt.StateDelta {",
        "    if value == nil {",
        "      delete(sess.State, key)",
        "      continue",
        "    }",
        "    sess.State[key] = append([]byte(nil), value...)",
        "  }",
        "}",
      ],
    },
    {
      title: "plugin/errormessage.go",
      lines: [
        "func (p *errorMessagePlugin) onEvent(",
        "  ctx context.Context,",
        "  invocation *agent.Invocation,",
        "  evt *event.Event,",
        ") (*event.Event, error) {",
        "  if evt == nil || evt.Error == nil {",
        "    return evt, nil",
        "  }",
        "  if !isRewritableErrorEvent(evt) {",
        "    return evt, nil",
        "  }",
        "  patched := evt.Clone()",
        "  patched.Response = newVisibleErrorResponse(evt.Error)",
        "  return patched, nil",
        "}",
      ],
    },
    {
      title: "examples/multiagent/parallel.go",
      lines: [
        "func assembleTeam(tasks []agent.Agent) agent.Agent {",
        "  analyzer := chainagent.New(",
        "    \"analysis-pipeline\",",
        "    chainagent.WithSubAgents(tasks[:2]),",
        "  )",
        "  workers := parallelagent.New(",
        "    \"parallel-workers\",",
        "    parallelagent.WithSubAgents(tasks),",
        "  )",
        "  return cycleagent.New(",
        "    \"review-loop\",",
        "    cycleagent.WithSubAgents([]agent.Agent{analyzer, workers}),",
        "    cycleagent.WithMaxIterations(3),",
        "  )",
        "}",
      ],
    },
    {
      title: "evaluation/workflow/run.go",
      lines: [
        "func evaluateSet(ctx context.Context, cases []EvalCase) Report {",
        "  report := Report{StartedAt: time.Now()}",
        "  for _, tc := range cases {",
        "    result := runCase(ctx, tc)",
        "    report.Total++",
        "    report.Latency += result.Latency",
        "    switch {",
        "    case result.Error != nil:",
        "      report.Failed++",
        "    case result.Score >= tc.Threshold:",
        "      report.Passed++",
        "    default:",
        "      report.Regressed++",
        "    }",
        "  }",
        "  report.FinishedAt = time.Now()",
        "  return report",
        "}",
      ],
    },
  ];

  const MATH_SNIPPETS = [
    {
      title: "高中数学 / 函数与导数",
      lines: [
        "f(x)=x^3-3x^2+2",
        "f'(x)=3x^2-6x=3x(x-2)",
        "critical points: x=0, x=2",
        "x<0 or x>2  ->  f'(x)>0",
        "0<x<2       ->  f'(x)<0",
        "local max: f(0)=2",
        "local min: f(2)=-2",
        "",
        "tangent at x=1:",
        "f(1)=0, f'(1)=-3",
        "y-0=-3(x-1)",
        "y=-3x+3",
      ],
    },
    {
      title: "高中数学 / 三角恒等变换",
      lines: [
        "sin^2 x + cos^2 x = 1",
        "tan x = sin x / cos x",
        "sin(a+b)=sin a cos b + cos a sin b",
        "cos(a+b)=cos a cos b - sin a sin b",
        "",
        "If sin x = 3/5 and x in Quadrant I:",
        "cos x = 4/5",
        "tan x = 3/4",
        "",
        "2 sin x cos x = sin 2x",
        "cos^2 x - sin^2 x = cos 2x",
      ],
    },
    {
      title: "高中数学 / 概率统计",
      lines: [
        "P(A union B)=P(A)+P(B)-P(A inter B)",
        "If A and B are independent:",
        "P(A inter B)=P(A)P(B)",
        "P(A|B)=P(A inter B)/P(B)",
        "",
        "E(X)=sum x_i p_i",
        "Var(X)=E(X^2)-[E(X)]^2",
        "sigma=sqrt(Var(X))",
        "",
        "binomial: X~B(n,p)",
        "P(X=k)=C(n,k)p^k(1-p)^(n-k)",
      ],
    },
    {
      title: "高中数学 / 数列与不等式",
      lines: [
        "arithmetic sequence:",
        "a_n=a_1+(n-1)d",
        "S_n=n(a_1+a_n)/2",
        "",
        "geometric sequence:",
        "a_n=a_1 q^(n-1)",
        "S_n=a_1(1-q^n)/(1-q), q != 1",
        "",
        "AM-GM:",
        "for a>0, b>0",
        "(a+b)/2 >= sqrt(ab)",
      ],
    },
  ];

  const ENGLISH_SNIPPETS = [
    {
      title: "高中英语 / 语法填空",
      lines: [
        "If I had reviewed the notes earlier,",
        "I would have felt calmer in the exam.",
        "",
        "Although the passage looks difficult,",
        "the main idea is hidden in topic sentences.",
        "",
        "The project, which was led by students,",
        "won first prize at the science fair.",
        "",
        "Neither pressure nor failure can stop",
        "a learner who keeps improving every day.",
      ],
    },
    {
      title: "高中英语 / 写作句型",
      lines: [
        "There is no doubt that practice matters.",
        "What impresses me most is your patience.",
        "Only by reading widely can we write well.",
        "",
        "From my point of view,",
        "confidence grows out of steady effort.",
        "",
        "Not only does the activity build teamwork,",
        "but it also helps us understand responsibility.",
      ],
    },
    {
      title: "高中英语 / 阅读理解",
      lines: [
        "Skimming helps us catch the structure.",
        "Scanning helps us find exact information.",
        "",
        "A contrast clue may appear after however,",
        "while a cause clue often follows because.",
        "",
        "When choosing the best title,",
        "focus on the whole passage, not one detail.",
        "",
        "Inference questions ask what the writer implies,",
        "instead of what is directly stated.",
      ],
    },
    {
      title: "高中英语 / 完形填空",
      lines: [
        "Look before and after each blank.",
        "Keep the tone of the story consistent.",
        "",
        "If the sentence shows a result,",
        "choose therefore or so.",
        "",
        "If it shows a concession,",
        "choose although, though, or even if.",
        "",
        "A good answer must fit grammar,",
        "meaning, collocation, and context.",
      ],
    },
  ];

  const HIGHLIGHT = {
    keyword: "#ff7b5f",
    string: "#f6c85f",
    number: "#8be36a",
    function: "#34d1bf",
    property: "#9ae8ff",
    comment: "#6d7a75",
    punctuation: "#9ba7a0",
    operator: "#f4f7f2",
    identifier: "#d9e1dc",
  };

  const KEYWORDS = new Set([
    "async",
    "await",
    "break",
    "chan",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "default",
    "defer",
    "else",
    "export",
    "false",
    "for",
    "from",
    "function",
    "def",
    "fn",
    "func",
    "go",
    "if",
    "import",
    "in",
    "interface",
    "let",
    "make",
    "map",
    "mut",
    "new",
    "nil",
    "null",
    "package",
    "pub",
    "range",
    "repeat",
    "return",
    "select",
    "struct",
    "switch",
    "throw",
    "true",
    "try",
    "type",
    "val",
    "var",
    "while",
  ]);

  const MATH_WORDS = new Set([
    "AM",
    "GM",
    "C",
    "E",
    "If",
    "P",
    "Quadrant",
    "S",
    "Var",
    "and",
    "arithmetic",
    "binomial",
    "cos",
    "critical",
    "for",
    "geometric",
    "in",
    "independent",
    "inter",
    "local",
    "max",
    "min",
    "or",
    "points",
    "sequence",
    "sigma",
    "sin",
    "sqrt",
    "sum",
    "tan",
    "tangent",
    "union",
  ]);

  const ENGLISH_WORDS = new Set([
    "Although",
    "From",
    "If",
    "Inference",
    "Neither",
    "Not",
    "Only",
    "Scanning",
    "Skimming",
    "There",
    "What",
    "When",
    "a",
    "after",
    "although",
    "and",
    "because",
    "before",
    "but",
    "by",
    "can",
    "does",
    "even",
    "however",
    "if",
    "instead",
    "nor",
    "not",
    "of",
    "or",
    "so",
    "that",
    "therefore",
    "though",
    "which",
    "while",
    "who",
  ]);

  const CONTENT_MODES = {
    code: {
      label: "代码",
      snippets: CODE_SNIPPETS,
    },
    math: {
      label: "数学",
      snippets: MATH_SNIPPETS,
    },
    english: {
      label: "英语",
      snippets: ENGLISH_SNIPPETS,
    },
  };

  const CODE_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

  let width = 1;
  let height = 1;
  let dpr = 1;
  let backdropCache = null;
  let lastTime = 0;
  let state = "idle";
  let score = 0;
  let combo = 1;
  let cleaned = 0;
  let totalCleanable = 0;
  let level = 1;
  let snippetDeck = [];
  let currentSnippet = null;
  let snippetComplete = false;
  let nextSnippetTimer = 0;
  let elapsed = 0;
  let pressure = 1;
  let sprayActive = false;
  let activeMode = "code";
  let activeWeapon = "water";
  let lastHitAt = 0;
  let screenShake = 0;
  const hudCache = {
    score: "",
    combo: "",
    clean: "",
    roundState: "",
    pauseMode: "",
  };

  const aim = { x: 0, y: 0 };
  const gun = {
    x: 96,
    y: 96,
    targetX: 96,
    targetY: 96,
    tipX: 120,
    tipY: 80,
    angle: 0,
    moving: 0,
  };
  const keys = { left: false, right: false, up: false, down: false };
  const snippets = [];
  const codeChars = [];
  const droplets = [];
  const bursts = [];
  const foam = [];
  const PARTICLE_LIMITS = {
    droplets: 240,
    bursts: 150,
    foam: 70,
  };
  const MAX_SPLASHES_PER_FRAME = 18;
  const EFFECT_EPS = 0.07;
  let frameSplashes = 0;

  const rand = (min, max) => Math.random() * (max - min) + min;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function trimList(list, limit) {
    if (list.length > limit) {
      list.splice(0, list.length - limit);
    }
  }

  function setCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(260, rect.height);
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    backdropCache = null;
    aim.x = aim.x || width * 0.66;
    aim.y = aim.y || height * 0.42;
    if (lastTime === 0) {
      placeGunAtStart();
    } else {
      gun.targetX = clamp(gun.targetX, 58, width - 58);
      gun.targetY = clamp(gun.targetY, 48, height - 48);
    }

    if (state === "idle") {
      buildCodeScene();
      updateHud();
    }
  }

  function resetRound() {
    score = 0;
    combo = 1;
    cleaned = 0;
    level = 1;
    snippetDeck = [];
    currentSnippet = pickNextSnippet();
    snippetComplete = false;
    nextSnippetTimer = 0;
    elapsed = 0;
    pressure = 1;
    sprayActive = false;
    lastHitAt = 0;
    screenShake = 0;
    droplets.length = 0;
    bursts.length = 0;
    foam.length = 0;
    buildCodeScene();
    updateHud();
  }

  function placeGunAtStart() {
    gun.x = clamp(width * 0.16, 76, width - 70);
    gun.y = height - clamp(height * 0.13, 58, 88);
    gun.targetX = gun.x;
    gun.targetY = gun.y;
    aim.x = width * 0.58;
    aim.y = height * 0.26;
  }

  function refillSnippetDeck() {
    const source = modeConfig().snippets;
    snippetDeck = source.map((_, index) => index);
    for (let i = snippetDeck.length - 1; i > 0; i -= 1) {
      const swap = Math.floor(Math.random() * (i + 1));
      [snippetDeck[i], snippetDeck[swap]] = [snippetDeck[swap], snippetDeck[i]];
    }
  }

  function pickNextSnippet() {
    if (snippetDeck.length === 0) {
      refillSnippetDeck();
    }
    const index = snippetDeck.shift();
    return modeConfig().snippets[index];
  }

  function buildCodeScene() {
    snippets.length = 0;
    codeChars.length = 0;
    cleaned = 0;
    snippetComplete = false;

    if (!currentSnippet) {
      currentSnippet = pickNextSnippet();
    }

    const maxLen = Math.max(...currentSnippet.lines.map((line) => line.length));
    const fitFont = (width - 56) / Math.max(24, maxLen * 0.64 + 5.5);
    const baseFont = Math.round(clamp(Math.min(width / 70, fitFont), width < 620 ? 8 : 13, 18));
    const lineHeight = Math.round(baseFont * 1.72);
    const padding = Math.round(baseFont * 1.25);
    const gutter = Math.round(baseFont * 3.15);
    const header = Math.round(baseFont * 2.35);

    ctx.save();
    ctx.font = `${baseFont}px ${CODE_FONT}`;
    const charWidth = Math.ceil(ctx.measureText("M").width);
    ctx.restore();

    const desiredWidth = Math.ceil(maxLen * charWidth + gutter + padding * 2);
    const panelWidth = clamp(desiredWidth, width < 620 ? width - 24 : 470, width - 28);
    const panelHeight = header + padding * 1.15 + currentSnippet.lines.length * lineHeight;
    const panel = {
      ...currentSnippet,
      mode: activeMode,
      level,
      fontSize: baseFont,
      charWidth,
      lineHeight,
      padding,
      gutter,
      header,
      width: panelWidth,
      height: panelHeight,
      x: 0,
      y: 0,
      birth: elapsed,
    };

    layoutPanel(panel);
    panel.cache = createPanelCache(panel);
    snippets.push(panel);
    createCharsForPanel(panel);
    totalCleanable = codeChars.length;
  }

  function makeCacheCanvas(cacheWidth, cacheHeight) {
    const cacheCanvas = document.createElement("canvas");
    cacheCanvas.width = Math.max(1, Math.round(cacheWidth * dpr));
    cacheCanvas.height = Math.max(1, Math.round(cacheHeight * dpr));
    const cacheCtx = cacheCanvas.getContext("2d");
    cacheCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { canvas: cacheCanvas, ctx: cacheCtx, width: cacheWidth, height: cacheHeight, dpr };
  }

  function createPanelCache(panel) {
    const cache = makeCacheCanvas(panel.width, panel.height);
    const panelCtx = cache.ctx;

    panelCtx.save();
    roundRect(panelCtx, 0, 0, panel.width, panel.height, 8);
    panelCtx.fillStyle = "rgba(16, 19, 22, 0.82)";
    panelCtx.fill();
    panelCtx.strokeStyle = "rgba(244, 247, 242, 0.14)";
    panelCtx.lineWidth = 1;
    panelCtx.stroke();

    roundRect(panelCtx, 0, 0, panel.width, panel.header, 8);
    panelCtx.fillStyle = "rgba(32, 39, 48, 0.86)";
    panelCtx.fill();

    panelCtx.fillStyle = "rgba(255, 123, 95, 0.78)";
    panelCtx.beginPath();
    panelCtx.arc(15, panel.header / 2, 4, 0, Math.PI * 2);
    panelCtx.fill();
    panelCtx.fillStyle = "rgba(246, 200, 95, 0.78)";
    panelCtx.beginPath();
    panelCtx.arc(30, panel.header / 2, 4, 0, Math.PI * 2);
    panelCtx.fill();
    panelCtx.fillStyle = "rgba(139, 227, 106, 0.78)";
    panelCtx.beginPath();
    panelCtx.arc(45, panel.header / 2, 4, 0, Math.PI * 2);
    panelCtx.fill();

    panelCtx.font = `700 ${Math.max(10, panel.fontSize - 2)}px ${CODE_FONT}`;
    panelCtx.textAlign = "left";
    panelCtx.textBaseline = "middle";
    panelCtx.fillStyle = "rgba(244, 247, 242, 0.58)";
    panelCtx.fillText(panel.title, 62, panel.header / 2 + 0.5);

    const lineTop = panel.header + panel.padding;
    panelCtx.font = `${Math.max(10, panel.fontSize - 1)}px ${CODE_FONT}`;
    panelCtx.textAlign = "right";
    panelCtx.textBaseline = "alphabetic";
    panelCtx.fillStyle = "rgba(155, 167, 160, 0.5)";

    for (let i = 0; i < panel.lines.length; i += 1) {
      const y = lineTop + i * panel.lineHeight;
      panelCtx.fillText(String(i + 1).padStart(2, " "), panel.gutter - 13, y);
    }

    panelCtx.strokeStyle = "rgba(244, 247, 242, 0.08)";
    panelCtx.beginPath();
    panelCtx.moveTo(panel.gutter, panel.header + 5);
    panelCtx.lineTo(panel.gutter, panel.height - 10);
    panelCtx.stroke();
    panelCtx.restore();

    return cache;
  }

  function layoutPanel(panel) {
    if (width < 620) {
      panel.x = 12;
      panel.y = Math.max(18, Math.min(height * 0.08, height - panel.height - 96));
      return;
    }

    const drift = Math.sin(level * 1.7) * Math.min(90, width * 0.08);
    panel.x = clamp((width - panel.width) * 0.5 + drift, 176, width - panel.width - 24);
    panel.y = clamp(height * 0.1 + Math.cos(level * 1.2) * 28, 28, height - panel.height - 130);
  }

  function createCharsForPanel(panel) {
    const textX = panel.x + panel.gutter + panel.padding;
    const textTop = panel.y + panel.header + panel.padding;
    for (let lineIndex = 0; lineIndex < panel.lines.length; lineIndex += 1) {
      const line = panel.lines[lineIndex];
      const segments = highlightLine(line, panel.mode || activeMode);
      let column = 0;
      for (const segment of segments) {
        for (const char of segment.text) {
          if (char !== " ") {
            const x = textX + column * panel.charWidth;
            const y = textTop + lineIndex * panel.lineHeight;
            codeChars.push({
              char,
              originX: x,
              originY: y,
              x,
              y,
              vx: 0,
              vy: 0,
              angle: 0,
              spin: 0,
              fontSize: panel.fontSize,
              charWidth: panel.charWidth,
              lineHeight: panel.lineHeight,
              color: segment.color,
              hp: rand(24, 42),
              maxHp: 42,
              wet: 0,
              heat: 0,
              frost: 0,
              shock: 0,
              impact: 0,
              jitter: 0,
              breakWeapon: "water",
              state: "attached",
            });
          }
          column += 1;
        }
      }
    }
  }

  function highlightLine(line, modeName = activeMode) {
    if (modeName === "math") {
      return highlightMathLine(line);
    }
    if (modeName === "english") {
      return highlightEnglishLine(line);
    }
    return highlightCodeLine(line);
  }

  function tokenizeLine(line, tokenPattern, colorForTokenFn) {
    const segments = [];
    let cursor = 0;
    let match = tokenPattern.exec(line);

    while (match) {
      if (match.index > cursor) {
        segments.push({ text: line.slice(cursor, match.index), color: HIGHLIGHT.identifier });
      }

      const token = match[0];
      segments.push({ text: token, color: colorForTokenFn(token, line, match.index) });
      cursor = match.index + token.length;
      match = tokenPattern.exec(line);
    }

    if (cursor < line.length) {
      segments.push({ text: line.slice(cursor), color: HIGHLIGHT.identifier });
    }
    return segments;
  }

  function highlightCodeLine(line) {
    const tokenPattern =
      /\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|[A-Za-z_$][\w$]*(?=\s*\()|[A-Za-z_$][\w$]*|===|!==|=>|\+\+|--|\+=|-=|[{}()[\].,;:+\-*/=<>!&|?]/g;
    return tokenizeLine(line, tokenPattern, colorForCodeToken);
  }

  function highlightMathLine(line) {
    const tokenPattern =
      /\b(?:sin|cos|tan|sqrt|sum|log|ln|lim|Var|Quadrant|AM|GM)\b|\b[A-Za-z]+(?:_[A-Za-z0-9]+)?\b|\b\d+(?:\.\d+)?\b|>=|<=|!=|->|[{}()[\].,;:+\-*/=<>!&|?^~]/g;
    return tokenizeLine(line, tokenPattern, colorForMathToken);
  }

  function highlightEnglishLine(line) {
    const tokenPattern = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b[A-Za-z]+(?:'[A-Za-z]+)?\b|\b\d+\b|[{}()[\].,;:!?-]/g;
    return tokenizeLine(line, tokenPattern, colorForEnglishToken);
  }

  function colorForCodeToken(token, line, index) {
    if (token.startsWith("//")) {
      return HIGHLIGHT.comment;
    }
    if (token.startsWith("'") || token.startsWith('"') || token.startsWith("`")) {
      return HIGHLIGHT.string;
    }
    if (/^\d/.test(token)) {
      return HIGHLIGHT.number;
    }
    if (KEYWORDS.has(token)) {
      return HIGHLIGHT.keyword;
    }
    if (/^[A-Za-z_$]/.test(token) && line.slice(index + token.length).trimStart().startsWith("(")) {
      return HIGHLIGHT.function;
    }
    if (/^[{}()[\].,;:]$/.test(token)) {
      return HIGHLIGHT.punctuation;
    }
    if (/^(===|!==|=>|\+\+|--|\+=|-=|[+\-*/=<>!&|?])$/.test(token)) {
      return HIGHLIGHT.operator;
    }
    if (index > 0 && line[index - 1] === ".") {
      return HIGHLIGHT.property;
    }
    return HIGHLIGHT.identifier;
  }

  function colorForMathToken(token) {
    if (/^\d/.test(token)) {
      return HIGHLIGHT.number;
    }
    if (/^(>=|<=|!=|->|[+\-*/=<>^~])$/.test(token)) {
      return HIGHLIGHT.operator;
    }
    if (/^[{}()[\].,;:!?]$/.test(token)) {
      return HIGHLIGHT.punctuation;
    }
    if (MATH_WORDS.has(token)) {
      return HIGHLIGHT.function;
    }
    if (/^[a-zA-Z](_[a-zA-Z0-9]+)?$/.test(token)) {
      return HIGHLIGHT.keyword;
    }
    return HIGHLIGHT.identifier;
  }

  function colorForEnglishToken(token) {
    if (token.startsWith("'") || token.startsWith('"')) {
      return HIGHLIGHT.string;
    }
    if (/^\d/.test(token)) {
      return HIGHLIGHT.number;
    }
    if (/^[{}()[\].,;:!?-]$/.test(token)) {
      return HIGHLIGHT.punctuation;
    }
    if (ENGLISH_WORDS.has(token)) {
      return HIGHLIGHT.keyword;
    }
    if (token.length >= 8) {
      return HIGHLIGHT.function;
    }
    return HIGHLIGHT.identifier;
  }

  function startGame() {
    if (state === "playing") {
      return;
    }
    if (state === "idle") {
      resetRound();
    }
    state = "playing";
    startOverlay.classList.add("hidden");
    updateHud();
  }

  function pauseGame() {
    if (state !== "playing") {
      return;
    }
    state = "paused";
    sprayActive = false;
    updateHud();
  }

  function togglePause() {
    if (state === "playing") {
      pauseGame();
      return;
    }
    if (state === "paused") {
      state = "playing";
      updateHud();
    }
  }

  function hardReset() {
    resetRound();
    state = "playing";
    startOverlay.classList.add("hidden");
    updateHud();
  }

  function modeConfig() {
    return CONTENT_MODES[activeMode] || CONTENT_MODES.code;
  }

  function weaponConfig() {
    return WEAPONS[activeWeapon] || WEAPONS.water;
  }

  function setMode(name) {
    if (!CONTENT_MODES[name] || activeMode === name) {
      return;
    }
    activeMode = name;
    resetRound();
    screenShake = Math.min(8, screenShake + 2.2);
    if (state !== "idle") {
      startOverlay.classList.add("hidden");
    }
    updateModeUI();
    updateHud();
  }

  function setWeapon(name) {
    if (!WEAPONS[name] || activeWeapon === name) {
      return;
    }
    activeWeapon = name;
    screenShake = Math.min(6, screenShake + 1.2);
    updateWeaponUI();
    updateHud();
  }

  function cycleWeapon(direction) {
    const index = WEAPON_ORDER.indexOf(activeWeapon);
    const next = (index + direction + WEAPON_ORDER.length) % WEAPON_ORDER.length;
    setWeapon(WEAPON_ORDER[next]);
  }

  function updateWeaponUI() {
    for (const button of weaponButtons) {
      const selected = button.dataset.weapon === activeWeapon;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    }
  }

  function updateModeUI() {
    for (const button of modeButtons) {
      const selected = button.dataset.mode === activeMode;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    }
  }

  function updateHud() {
    const weapon = weaponConfig();
    const mode = modeConfig();
    const scoreText = String(Math.floor(score)).padStart(6, "0");
    if (hudCache.score !== scoreText) {
      scoreEl.textContent = scoreText;
      hudCache.score = scoreText;
    }

    const comboText = `x${combo}`;
    if (hudCache.combo !== comboText) {
      comboEl.textContent = comboText;
      hudCache.combo = comboText;
    }

    const progress = totalCleanable > 0 ? cleaned / totalCleanable : 0;
    const cleanText = `${Math.round(progress * 100)}%`;
    if (hudCache.clean !== cleanText) {
      cleanEl.textContent = cleanText;
      hudCache.clean = cleanText;
    }

    if (state === "idle") {
      setRoundState(`${mode.label} · ${weapon.label}待机`);
      setPauseMode("pause");
      return;
    }

    if (state === "paused") {
      setRoundState("已暂停");
      setPauseMode("play");
      return;
    }

    let stateText;
    if (nextSnippetTimer > 0) {
      stateText = `${mode.label} · ${weapon.label}换段`;
    } else if (cleaned >= totalCleanable && totalCleanable > 0) {
      stateText = `${mode.label} · ${weapon.label} · 第 ${level} 段已清`;
    } else {
      stateText =
        combo > 10 ? `${mode.label} · ${weapon.label} · 第 ${level} 段连击` : `${mode.label} · ${weapon.label} · 第 ${level} 段`;
    }
    setRoundState(stateText);
    setPauseMode("pause");
  }

  function setRoundState(text) {
    if (hudCache.roundState !== text) {
      roundState.textContent = text;
      hudCache.roundState = text;
    }
  }

  function setPauseMode(mode) {
    if (hudCache.pauseMode === mode) {
      return;
    }
    const isPlay = mode === "play";
    pauseBtn.setAttribute("aria-label", isPlay ? "继续" : "暂停");
    pauseBtn.querySelector("span").textContent = isPlay ? "继续" : "暂停";
    pauseBtn.querySelector("svg").innerHTML = isPlay ? PLAY_ICON : PAUSE_ICON;
    hudCache.pauseMode = mode;
  }

  function update(dt) {
    pressure = 1;
    frameSplashes = 0;
    updateGun(dt);

    if (state === "playing") {
      elapsed += dt;

      if (nextSnippetTimer > 0) {
        nextSnippetTimer -= dt;
        if (nextSnippetTimer <= 0) {
          loadNextSnippet();
        }
      } else if (sprayActive) {
        pushSprayParticles(dt);
        applySprayDamage(dt);
      }

      if (lastHitAt > 0 && elapsed - lastHitAt > 2.4) {
        combo = 1;
      }

      maybeCompleteSnippet();
    }

    updateCodeCharacters(dt);
    updateParticles(dt);
    screenShake = Math.max(0, screenShake - dt * 18);
    updateHud();
  }

  function maybeCompleteSnippet() {
    if (snippetComplete || totalCleanable === 0) {
      return;
    }

    if (cleaned < totalCleanable) {
      return;
    }

    snippetComplete = true;
    nextSnippetTimer = 1.05;
    score += Math.floor(360 * Math.max(1, combo / 6));
    combo = clamp(combo + 6, 1, 99);
    screenShake = Math.min(11, screenShake + 4.5);
  }

  function loadNextSnippet() {
    level += 1;
    currentSnippet = pickNextSnippet();
    snippetComplete = false;
    nextSnippetTimer = 0;
    buildCodeScene();
    sprayActive = false;
    pressure = 1;
    screenShake = Math.min(8, screenShake + 2.5);
  }

  function updateGun(dt) {
    const moveSpeed = 620 * dt;
    if (keys.left) {
      gun.targetX -= moveSpeed;
    }
    if (keys.right) {
      gun.targetX += moveSpeed;
    }
    if (keys.up) {
      gun.targetY -= moveSpeed;
    }
    if (keys.down) {
      gun.targetY += moveSpeed;
    }

    gun.targetX = clamp(gun.targetX, 48, width - 48);
    gun.targetY = clamp(gun.targetY, 48, height - 48);
    const follow = 1 - Math.exp(-dt * 12);
    gun.x += (gun.targetX - gun.x) * follow;
    gun.y += (gun.targetY - gun.y) * follow;
    gun.moving = Math.hypot(gun.targetX - gun.x, gun.targetY - gun.y);
    gun.angle = Math.atan2(aim.y - gun.y, aim.x - gun.x);
    const barrel = 80;
    gun.tipX = gun.x + Math.cos(gun.angle) * barrel;
    gun.tipY = gun.y + Math.sin(gun.angle) * barrel;
  }

  function updateCodeCharacters(dt) {
    for (const codeChar of codeChars) {
      if (codeChar.state === "attached") {
        codeChar.wet = Math.max(0, codeChar.wet - dt * 0.9);
        codeChar.heat = Math.max(0, codeChar.heat - dt * 1.35);
        codeChar.frost = Math.max(0, codeChar.frost - dt * 0.55);
        codeChar.shock = Math.max(0, codeChar.shock - dt * 2.2);
        codeChar.impact = Math.max(0, codeChar.impact - dt * 0.55);
        codeChar.jitter = Math.max(0, codeChar.jitter - dt * 24);
        continue;
      }

      if (codeChar.state === "falling") {
        codeChar.vy += 680 * dt;
        codeChar.vx *= 0.996;
        codeChar.x += codeChar.vx * dt;
        codeChar.y += codeChar.vy * dt;
        codeChar.angle += codeChar.spin * dt;
        codeChar.wet = Math.max(0, codeChar.wet - dt * 0.45);
        codeChar.heat = Math.max(0, codeChar.heat - dt * 0.8);
        codeChar.frost = Math.max(0, codeChar.frost - dt * 0.5);
        codeChar.shock = Math.max(0, codeChar.shock - dt * 1.6);
        codeChar.impact = Math.max(0, codeChar.impact - dt * 1.2);
        if (codeChar.y > height + 80) {
          codeChar.state = "gone";
        }
      }
    }
  }

  function updateParticles(dt) {
    updateParticleList(droplets, dt, true);
    updateParticleList(bursts, dt, false);

    for (let i = foam.length - 1; i >= 0; i -= 1) {
      const puff = foam[i];
      puff.life -= dt;
      puff.radius += dt * 18;
      puff.alpha -= dt * 0.75;
      if (puff.life <= 0 || puff.alpha <= 0) {
        foam.splice(i, 1);
      }
    }
  }

  function updateParticleList(list, dt, hasGravity) {
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const particle = list[i];
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.angle += particle.spin * dt;
      if (hasGravity) {
        particle.vy += (particle.gravity ?? 260) * dt;
      }
      particle.vx *= 0.992;
      particle.vy *= 0.992;
      if (particle.life <= 0) {
        list.splice(i, 1);
      }
    }
  }

  function pushSprayParticles(dt) {
    const weapon = weaponConfig();
    const amount = clamp(Math.floor((activeWeapon === "laser" ? 115 : 250) * dt * (0.45 + pressure)), 1, 9);
    const angle = gun.angle;
    const sprayLimit = currentSprayRange(weapon.rangeBase + pressure * weapon.rangeBoost);
    for (let i = 0; i < amount; i += 1) {
      const spread =
        activeWeapon === "fire"
          ? rand(-0.28, 0.28)
          : activeWeapon === "ice"
            ? rand(-0.16, 0.16)
            : activeWeapon === "laser"
              ? rand(-0.035, 0.035)
              : rand(-0.12, 0.12) * (1.05 - pressure * 0.28);
      const speed =
        activeWeapon === "laser"
          ? rand(820, 1280)
          : activeWeapon === "fire"
            ? rand(360, 760)
            : activeWeapon === "ice"
              ? rand(420, 820)
              : rand(520, 980);
      const color =
        activeWeapon === "fire"
          ? (Math.random() > 0.45 ? "#ff7b5f" : Math.random() > 0.45 ? "#ffb14e" : "#fff2a8")
          : activeWeapon === "ice"
            ? (Math.random() > 0.35 ? "#9ae8ff" : "#f5fdff")
            : activeWeapon === "laser"
              ? (Math.random() > 0.5 ? "#d47cff" : "#79e8ff")
              : (Math.random() > 0.18 ? "#79e8ff" : "#e7fff8");
      droplets.push({
        x: gun.tipX + rand(-5, 5),
        y: gun.tipY + rand(-5, 5),
        vx: Math.cos(angle + spread) * speed,
        vy: Math.sin(angle + spread) * speed,
        radius: activeWeapon === "laser" ? rand(1, 2.8) : rand(1.8, 6.4),
        life: activeWeapon === "laser" ? rand(0.12, 0.28) : rand(0.22, 0.64),
        color,
        streak: activeWeapon === "laser" || Math.random() > 0.36,
        gravity: activeWeapon === "fire" ? -120 : activeWeapon === "ice" ? 60 : activeWeapon === "laser" ? 0 : 260,
        angle: 0,
        spin: 0,
      });
    }

    if (Math.random() < dt * (activeWeapon === "laser" ? 34 : 18)) {
      const distance = rand(52, Math.max(64, sprayLimit - 28));
      const side = rand(-weapon.widthBase, weapon.widthBase);
      droplets.push({
        x: gun.tipX + Math.cos(angle) * distance - Math.sin(angle) * side,
        y: gun.tipY + Math.sin(angle) * distance + Math.cos(angle) * side,
        vx: Math.cos(angle + rand(-0.38, 0.38)) * rand(40, 150),
        vy: Math.sin(angle + rand(-0.38, 0.38)) * rand(40, 150),
        radius: activeWeapon === "laser" ? rand(1.2, 2.4) : rand(1.2, 3.6),
        life: rand(0.16, 0.4),
        color: weapon.puff,
        streak: activeWeapon === "laser",
        gravity: activeWeapon === "fire" ? -90 : activeWeapon === "laser" ? 0 : 120,
        angle: 0,
        spin: 0,
      });
    }

    trimList(droplets, PARTICLE_LIMITS.droplets);
  }

  function currentSprayRange(maxRange) {
    const weapon = weaponConfig();
    const aimDistance = Math.hypot(aim.x - gun.tipX, aim.y - gun.tipY);
    return clamp(aimDistance + weapon.rangeLead, weapon.minRange, maxRange);
  }

  function applySprayDamage(dt) {
    const weapon = weaponConfig();
    const dx = Math.cos(gun.angle);
    const dy = Math.sin(gun.angle);
    const range = currentSprayRange(weapon.rangeBase + pressure * weapon.rangeBoost);
    const damage = dt * (weapon.damageBase + pressure * weapon.damageBoost);
    let hits = 0;
    let addedFoam = false;

    for (const codeChar of codeChars) {
      if (codeChar.state !== "attached") {
        continue;
      }

      const centerX = codeChar.originX + codeChar.charWidth * 0.5;
      const centerY = codeChar.originY - codeChar.fontSize * 0.42;
      const px = centerX - gun.tipX;
      const py = centerY - gun.tipY;
      const projection = px * dx + py * dy;
      const inSprayRange = projection >= 0 && projection <= range;
      if (!inSprayRange) {
        continue;
      }

      const closestX = gun.tipX + dx * projection;
      const closestY = gun.tipY + dy * projection;
      const missX = centerX - closestX;
      const missY = centerY - closestY;
      const sprayWidth = weapon.widthBase + pressure * weapon.widthBoost + (projection / range) * weapon.widthFar;
      const hitRadius = sprayWidth + codeChar.fontSize * weapon.hitScale + weapon.hitBonus;

      const missSq = missX * missX + missY * missY;
      if (missSq < hitRadius * hitRadius) {
        const distance = Math.sqrt(missSq);
        const force = clamp(1.18 - distance / hitRadius, 0.28, 1.18);
        const freezeBonus = activeWeapon === "ice" ? 0.72 + codeChar.frost * 0.62 : 1;
        const laserBonus = activeWeapon === "laser" ? 1.18 : 1;
        codeChar.hp -= damage * force * freezeBonus * laserBonus;
        codeChar.impact = Math.min(1, codeChar.impact + dt * weapon.impactRate * (0.55 + force));
        codeChar.wet = activeWeapon === "water" ? 1 : Math.max(0, codeChar.wet - dt * 0.7);
        codeChar.heat = activeWeapon === "fire" ? Math.min(1, codeChar.heat + dt * (2.6 + force * 2.8)) : codeChar.heat;
        codeChar.frost = activeWeapon === "ice" ? Math.min(1, codeChar.frost + dt * (2.2 + force * 3.4)) : codeChar.frost;
        codeChar.shock = activeWeapon === "laser" ? 1 : Math.max(0, codeChar.shock - dt * 0.4);
        codeChar.jitter = Math.min(activeWeapon === "laser" ? 10 : 7, codeChar.jitter + 1.4 + force * 1.1);
        hits += 1;

        if (Math.random() < (activeWeapon === "laser" ? 0.34 : 0.2)) {
          foam.push({
            x: (closestX + centerX) * 0.5 + rand(-8, 8),
            y: (closestY + centerY) * 0.5 + rand(-8, 8),
            radius: activeWeapon === "laser" ? rand(3, 8) : rand(5, 12),
            alpha: activeWeapon === "fire" ? rand(0.3, 0.52) : rand(0.22, 0.44),
            life: activeWeapon === "laser" ? rand(0.12, 0.28) : rand(0.28, 0.58),
            color: weapon.puff,
          });
          addedFoam = true;
        }

        const stressBreak = codeChar.impact >= 1 && codeChar.hp <= codeChar.maxHp * 0.88;
        const effectBreak =
          (activeWeapon === "fire" && codeChar.heat > 0.92 && codeChar.hp <= codeChar.maxHp * weapon.popAt) ||
          (activeWeapon === "ice" && codeChar.frost > 0.88 && codeChar.hp <= codeChar.maxHp * weapon.popAt) ||
          (activeWeapon === "laser" && codeChar.shock > 0.9 && codeChar.hp <= codeChar.maxHp * weapon.popAt);

        if (codeChar.hp <= 0 || stressBreak || effectBreak) {
          detachChar(codeChar, dx, dy, activeWeapon);
        }
      }
    }

    if (hits > 0) {
      lastHitAt = elapsed;
    }
    if (addedFoam) {
      trimList(foam, PARTICLE_LIMITS.foam);
    }
  }

  function detachChar(codeChar, dx, dy, weaponName = activeWeapon) {
    const side = Math.random() > 0.5 ? 1 : -1;
    codeChar.state = "falling";
    codeChar.breakWeapon = weaponName;
    codeChar.x = codeChar.originX;
    codeChar.y = codeChar.originY;
    if (weaponName === "fire") {
      codeChar.vx = dx * rand(120, 260) + rand(-105, 105);
      codeChar.vy = dy * rand(40, 110) - rand(170, 310);
    } else if (weaponName === "ice") {
      codeChar.vx = -dy * side * rand(150, 310) + rand(-40, 40);
      codeChar.vy = dy * rand(30, 90) - rand(60, 180);
    } else if (weaponName === "laser") {
      codeChar.vx = dx * rand(260, 430) + -dy * side * rand(180, 360);
      codeChar.vy = dy * rand(150, 280) + dx * side * rand(50, 140) - rand(90, 190);
    } else {
      codeChar.vx = dx * rand(95, 210) + rand(-55, 55);
      codeChar.vy = dy * rand(70, 150) + rand(-120, 12);
    }
    codeChar.angle = rand(-0.25, 0.25);
    codeChar.spin = weaponName === "laser" || weaponName === "ice" ? rand(-12, 12) : rand(-7, 7);
    codeChar.wet = weaponName === "water" ? 1 : 0;
    codeChar.heat = weaponName === "fire" ? 1 : codeChar.heat;
    codeChar.frost = weaponName === "ice" ? 1 : codeChar.frost;
    codeChar.shock = weaponName === "laser" ? 1 : codeChar.shock;
    codeChar.jitter = 0;

    cleaned += 1;
    score += (8 + Math.floor(codeChar.fontSize * 0.75)) * combo;
    combo = clamp(combo + 1, 1, 99);
    screenShake = Math.min(10, screenShake + (weaponName === "laser" ? 0.9 : weaponName === "fire" ? 0.8 : 0.65));
    if (frameSplashes < MAX_SPLASHES_PER_FRAME) {
      frameSplashes += 1;
      makeCharSplash(codeChar.x, codeChar.y, codeChar.char, codeChar.color, weaponName);
    }
  }

  function makeCharSplash(x, y, char, color, weaponName = activeWeapon) {
    const weapon = WEAPONS[weaponName] || WEAPONS.water;
    const burstCount = weaponName === "laser" ? 5 : weaponName === "fire" || weaponName === "ice" ? 5 : 4;
    for (let i = 0; i < burstCount; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const speed = weaponName === "laser" ? rand(160, 330) : weaponName === "ice" ? rand(120, 260) : rand(70, 210);
      bursts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (weaponName === "fire" ? 90 : 20),
        size: weaponName === "laser" ? rand(7, 13) : rand(9, 15),
        life: weaponName === "laser" ? rand(0.2, 0.45) : rand(0.3, 0.68),
        text: char,
        color:
          weaponName === "fire"
            ? (Math.random() > 0.5 ? "#ffb14e" : "#fff2a8")
            : weaponName === "ice"
              ? (Math.random() > 0.5 ? "#9ae8ff" : "#f5fdff")
              : weaponName === "laser"
                ? (Math.random() > 0.5 ? "#d47cff" : "#ffffff")
                : (Math.random() > 0.35 ? color : "#e7fff8"),
        angle,
        spin: rand(-12, 12),
      });
    }

    const particleCount = weaponName === "laser" ? 5 : weaponName === "fire" ? 7 : 5;
    for (let i = 0; i < particleCount; i += 1) {
      droplets.push({
        x,
        y,
        vx: rand(-220, 220),
        vy: weaponName === "fire" ? rand(-260, -40) : rand(-210, 30),
        radius: weaponName === "laser" ? rand(1.2, 3) : rand(2, 5.2),
        life: weaponName === "laser" ? rand(0.16, 0.34) : rand(0.28, 0.72),
        color: weaponName === "water" ? (Math.random() > 0.28 ? "#79e8ff" : "#d7fff4") : weapon.puff,
        streak: weaponName === "laser" || weaponName === "fire",
        gravity: weaponName === "fire" ? -95 : weaponName === "laser" ? 0 : weaponName === "ice" ? 70 : 260,
        angle: 0,
        spin: 0,
      });
    }
    trimList(bursts, PARTICLE_LIMITS.bursts);
    trimList(droplets, PARTICLE_LIMITS.droplets);
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    if (screenShake > 0) {
      ctx.translate(rand(-screenShake, screenShake), rand(-screenShake, screenShake));
    }

    drawBackdrop();
    drawCodePanels();
    drawAttachedCharacters();
    drawFoam();
    drawSpray();
    drawParticles();
    drawFallingCharacters();
    drawGun();

    if (state === "paused") {
      drawPauseVeil();
    }

    ctx.restore();
  }

  function drawBackdrop() {
    if (!backdropCache || backdropCache.width !== width || backdropCache.height !== height || backdropCache.dpr !== dpr) {
      backdropCache = makeCacheCanvas(width, height);
      paintBackdrop(backdropCache.ctx, width, height);
    }
    ctx.drawImage(backdropCache.canvas, 0, 0, width, height);
  }

  function paintBackdrop(targetCtx, targetWidth, targetHeight) {
    const gradient = targetCtx.createLinearGradient(0, 0, targetWidth, targetHeight);
    gradient.addColorStop(0, "#101316");
    gradient.addColorStop(0.5, "#151d1b");
    gradient.addColorStop(1, "#201814");
    targetCtx.fillStyle = gradient;
    targetCtx.fillRect(0, 0, targetWidth, targetHeight);

    targetCtx.save();
    targetCtx.globalAlpha = 0.14;
    targetCtx.strokeStyle = "#f4f7f2";
    targetCtx.lineWidth = 1;
    const step = 42;
    for (let x = 0; x < targetWidth + step; x += step) {
      targetCtx.beginPath();
      targetCtx.moveTo(x, 0);
      targetCtx.lineTo(x, targetHeight);
      targetCtx.stroke();
    }
    for (let y = 0; y < targetHeight + step; y += step) {
      targetCtx.beginPath();
      targetCtx.moveTo(0, y);
      targetCtx.lineTo(targetWidth, y);
      targetCtx.stroke();
    }
    targetCtx.restore();

    const glow = targetCtx.createRadialGradient(
      targetWidth * 0.75,
      targetHeight * 0.4,
      10,
      targetWidth * 0.75,
      targetHeight * 0.4,
      targetWidth * 0.5,
    );
    glow.addColorStop(0, "rgba(52, 209, 191, 0.18)");
    glow.addColorStop(1, "rgba(52, 209, 191, 0)");
    targetCtx.fillStyle = glow;
    targetCtx.fillRect(0, 0, targetWidth, targetHeight);
  }

  function drawCodePanels() {
    for (const panel of snippets) {
      if (!panel.cache || panel.cache.dpr !== dpr) {
        panel.cache = createPanelCache(panel);
      }
      ctx.drawImage(panel.cache.canvas, panel.x, panel.y, panel.width, panel.height);
    }
  }

  function drawAttachedCharacters() {
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const progress = totalCleanable > 0 ? cleaned / totalCleanable : 0;
    let currentFont = "";
    for (const codeChar of codeChars) {
      if (codeChar.state !== "attached") {
        continue;
      }
      const wet = codeChar.wet > EFFECT_EPS ? codeChar.wet : 0;
      const heat = codeChar.heat > EFFECT_EPS ? codeChar.heat : 0;
      const frost = codeChar.frost > EFFECT_EPS ? codeChar.frost : 0;
      const shock = codeChar.shock > EFFECT_EPS ? codeChar.shock : 0;
      const shakeX = codeChar.jitter > 0 ? rand(-codeChar.jitter, codeChar.jitter) : 0;
      const shakeY = codeChar.jitter > 0 ? rand(-codeChar.jitter, codeChar.jitter) : 0;
      const searchPulse = progress > 0.82 ? (Math.sin(elapsed * 8 + codeChar.originX * 0.04) + 1) * 0.5 : 0;
      const nextFont = `700 ${codeChar.fontSize}px ${CODE_FONT}`;
      if (currentFont !== nextFont) {
        ctx.font = nextFont;
        currentFont = nextFont;
      }

      if (wet > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = wet * 0.28;
        ctx.fillStyle = "#79e8ff";
        ctx.beginPath();
        ctx.arc(
          codeChar.originX + codeChar.charWidth * 0.52,
          codeChar.originY - codeChar.fontSize * 0.42,
          codeChar.fontSize * 0.7,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.restore();
      }

      if (heat > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = heat * 0.34;
        ctx.fillStyle = "#ffb14e";
        ctx.beginPath();
        ctx.arc(
          codeChar.originX + codeChar.charWidth * 0.5,
          codeChar.originY - codeChar.fontSize * 0.48,
          codeChar.fontSize * 0.95,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.restore();
      }

      if (frost > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = frost * 0.36;
        ctx.strokeStyle = "#e7fff8";
        ctx.lineWidth = 1.2;
        const cx = codeChar.originX + codeChar.charWidth * 0.52;
        const cy = codeChar.originY - codeChar.fontSize * 0.46;
        const r = codeChar.fontSize * (0.42 + frost * 0.28);
        ctx.beginPath();
        ctx.moveTo(cx - r, cy);
        ctx.lineTo(cx + r, cy);
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx, cy + r);
        ctx.moveTo(cx - r * 0.7, cy - r * 0.7);
        ctx.lineTo(cx + r * 0.7, cy + r * 0.7);
        ctx.moveTo(cx + r * 0.7, cy - r * 0.7);
        ctx.lineTo(cx - r * 0.7, cy + r * 0.7);
        ctx.stroke();
        ctx.restore();
      }

      if (shock > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = shock * 0.6;
        ctx.strokeStyle = "#d47cff";
        ctx.lineWidth = 1.4;
        const cx = codeChar.originX + codeChar.charWidth * 0.5;
        const cy = codeChar.originY - codeChar.fontSize * 0.52;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy - 8);
        ctx.lineTo(cx + 2, cy - 2);
        ctx.lineTo(cx - 1, cy + 2);
        ctx.lineTo(cx + 7, cy + 7);
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = codeChar.color;
      if (shock > 0) {
        ctx.shadowColor = "rgba(212, 124, 255, 0.78)";
        ctx.shadowBlur = 9;
      } else if (heat > 0) {
        ctx.shadowColor = "rgba(255, 123, 95, 0.68)";
        ctx.shadowBlur = 8;
      } else if (frost > 0) {
        ctx.shadowColor = "rgba(154, 232, 255, 0.66)";
        ctx.shadowBlur = 7;
      } else if (wet > 0 || searchPulse > 0.05) {
        ctx.shadowColor = "rgba(121, 232, 255, 0.62)";
        ctx.shadowBlur = wet > 0 ? 6 : 3 + searchPulse * 5;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }
      ctx.fillText(codeChar.char, codeChar.originX + shakeX, codeChar.originY + shakeY);
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawFallingCharacters() {
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    for (const codeChar of codeChars) {
      if (codeChar.state !== "falling") {
        continue;
      }
      ctx.save();
      ctx.translate(codeChar.x + codeChar.charWidth * 0.5, codeChar.y - codeChar.fontSize * 0.5);
      ctx.rotate(codeChar.angle);
      ctx.font = `750 ${codeChar.fontSize}px ${CODE_FONT}`;
      ctx.globalAlpha = clamp((height + 80 - codeChar.y) / 120, 0, 1);
      ctx.fillStyle =
        codeChar.breakWeapon === "fire"
          ? "#ffb14e"
          : codeChar.breakWeapon === "ice"
            ? "#e7fff8"
            : codeChar.breakWeapon === "laser"
              ? "#ffffff"
              : codeChar.color;
      ctx.shadowColor =
        codeChar.breakWeapon === "fire"
          ? "rgba(255, 123, 95, 0.62)"
          : codeChar.breakWeapon === "ice"
            ? "rgba(154, 232, 255, 0.62)"
            : codeChar.breakWeapon === "laser"
              ? "rgba(212, 124, 255, 0.7)"
              : "rgba(121, 232, 255, 0.46)";
      ctx.shadowBlur = codeChar.breakWeapon === "laser" ? 8 : 5;
      ctx.fillText(codeChar.char, -codeChar.charWidth * 0.5, codeChar.fontSize * 0.45);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawSpray() {
    if (!sprayActive || pressure <= 0.02) {
      return;
    }

    const weapon = weaponConfig();
    const dx = Math.cos(gun.angle);
    const dy = Math.sin(gun.angle);
    const nx = -dy;
    const ny = dx;
    const range = currentSprayRange(weapon.rangeBase + pressure * weapon.rangeBoost);
    const distance = range;
    const endX = gun.tipX + dx * distance;
    const endY = gun.tipY + dy * distance;
    const pulse = (Math.sin(elapsed * 42) + 1) * 0.5;
    const twist = activeWeapon === "laser" ? 0 : Math.sin(elapsed * 29) * (9 + pressure * 7);
    const beam = ctx.createLinearGradient(gun.tipX, gun.tipY, endX, endY);
    beam.addColorStop(0, weapon.core);
    beam.addColorStop(0.26, weapon.main);
    beam.addColorStop(0.68, weapon.side);
    beam.addColorStop(1, weapon.end);

    ctx.save();
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = "lighter";

    ctx.globalAlpha = activeWeapon === "laser" ? 0.42 : 0.62;
    ctx.strokeStyle = beam;
    ctx.lineWidth =
      activeWeapon === "laser"
        ? 11 + pressure * 7 + pulse * 2
        : activeWeapon === "fire"
          ? 32 + pressure * 24 + pulse * 8
          : activeWeapon === "ice"
            ? 22 + pressure * 16 + pulse * 4
            : 24 + pressure * 18 + pulse * 4;
    ctx.beginPath();
    ctx.moveTo(gun.tipX, gun.tipY);
    ctx.bezierCurveTo(
      gun.tipX + dx * distance * 0.28 + nx * twist,
      gun.tipY + dy * distance * 0.28 + ny * twist,
      gun.tipX + dx * distance * 0.62 - nx * twist * 0.55,
      gun.tipY + dy * distance * 0.62 - ny * twist * 0.55,
      endX,
      endY,
    );
    ctx.stroke();

    const lineCount = activeWeapon === "laser" ? 2 : 3;
    for (let i = -1; i <= lineCount - 2; i += 1) {
      const offset = i * (activeWeapon === "laser" ? 3 + pressure * 2 : 8 + pressure * 6);
      const wobble = activeWeapon === "laser" ? 0 : Math.sin(elapsed * 38 + i * 2.4) * 5;
      ctx.globalAlpha = i === 0 ? 0.82 : 0.4;
      ctx.lineWidth =
        activeWeapon === "laser"
          ? (i === 0 ? 3.8 + pressure * 2.8 : 1.4)
          : i === 0
            ? 6 + pressure * 5
            : 2.6 + pressure * 3;
      ctx.strokeStyle = i === 0 ? weapon.core : weapon.side;
      ctx.beginPath();
      ctx.moveTo(gun.tipX + nx * offset, gun.tipY + ny * offset);
      ctx.quadraticCurveTo(
        gun.tipX + dx * distance * 0.52 + nx * (offset + wobble),
        gun.tipY + dy * distance * 0.52 + ny * (offset + wobble),
        endX + nx * offset * 0.16,
        endY + ny * offset * 0.16,
      );
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.lineWidth = activeWeapon === "laser" ? 1.6 : 2.4 + pressure * 1.8;
    ctx.strokeStyle = weapon.core;
    ctx.shadowColor = weapon.main;
    ctx.shadowBlur = activeWeapon === "laser" ? 18 : 8;
    ctx.beginPath();
    ctx.moveTo(gun.tipX, gun.tipY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (let i = 0; i < (activeWeapon === "laser" ? 4 : 3); i += 1) {
      const ringX = gun.tipX + dx * (18 + i * 15 + pulse * 7);
      const ringY = gun.tipY + dy * (18 + i * 15 + pulse * 7);
      ctx.globalAlpha = (0.34 - i * 0.08) * pressure;
      ctx.strokeStyle = weapon.core;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(ringX, ringY, (activeWeapon === "laser" ? 4 : 7) + i * 5 + pulse * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (activeWeapon === "fire") {
      for (let i = 0; i < 5; i += 1) {
        const side = rand(-1, 1) * (20 + pressure * 20);
        ctx.globalAlpha = 0.22 + pressure * 0.16;
        ctx.strokeStyle = i % 2 === 0 ? "#fff2a8" : "#ff7b5f";
        ctx.lineWidth = rand(5, 10);
        ctx.beginPath();
        ctx.moveTo(gun.tipX + nx * side * 0.15, gun.tipY + ny * side * 0.15);
        ctx.quadraticCurveTo(
          gun.tipX + dx * distance * rand(0.24, 0.58) + nx * side,
          gun.tipY + dy * distance * rand(0.24, 0.58) + ny * side,
          gun.tipX + dx * distance * rand(0.62, 0.96) + nx * side * 0.45,
          gun.tipY + dy * distance * rand(0.62, 0.96) + ny * side * 0.45,
        );
        ctx.stroke();
      }
    }

    if (activeWeapon === "ice") {
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = "#e7fff8";
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 7; i += 1) {
        const t = (i + pulse) / 7;
        const cx = gun.tipX + dx * distance * t + nx * Math.sin(elapsed * 8 + i) * 10;
        const cy = gun.tipY + dy * distance * t + ny * Math.sin(elapsed * 8 + i) * 10;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy);
        ctx.lineTo(cx + 5, cy);
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx, cy + 5);
        ctx.stroke();
      }
    }

    if (activeWeapon === "laser") {
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gun.tipX - nx * 2, gun.tipY - ny * 2);
      ctx.lineTo(endX - nx * 2, endY - ny * 2);
      ctx.moveTo(gun.tipX + nx * 2, gun.tipY + ny * 2);
      ctx.lineTo(endX + nx * 2, endY + ny * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.13 + pressure * 0.1;
    ctx.fillStyle = weapon.main;
    ctx.beginPath();
    ctx.arc(endX, endY, (activeWeapon === "laser" ? 13 : 20) + pulse * 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (const drop of droplets) {
      const alpha = clamp(drop.life * 2.3, 0, 1);
      ctx.globalAlpha = alpha;
      if (drop.streak) {
        ctx.strokeStyle = drop.color;
        ctx.lineWidth = Math.max(1.2, drop.radius * 0.7);
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.vx * 0.022, drop.y - drop.vy * 0.022);
        ctx.stroke();
      } else {
        ctx.fillStyle = drop.color;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const bit of bursts) {
      ctx.save();
      ctx.translate(bit.x, bit.y);
      ctx.rotate(bit.angle + bit.spin * bit.life);
      ctx.globalAlpha = clamp(bit.life * 1.8, 0, 1);
      ctx.fillStyle = bit.color;
      ctx.font = `750 ${bit.size}px ${CODE_FONT}`;
      ctx.fillText(bit.text, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawFoam() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const puff of foam) {
      ctx.globalAlpha = puff.alpha;
      ctx.fillStyle = puff.color || "#d7fff4";
      ctx.beginPath();
      ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGun() {
    const weapon = weaponConfig();
    const angle = gun.angle;
    const recoil = sprayActive && pressure > 0.02 ? weapon.recoil + Math.sin(elapsed * 48) * 1.4 : 0;
    const gx = gun.x - Math.cos(angle) * recoil;
    const gy = gun.y - Math.sin(angle) * recoil;

    drawHose();
    drawHand();

    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(angle);

    if (sprayActive && pressure > 0.02) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = weapon.glow;
      ctx.beginPath();
      ctx.ellipse(26, 0, 74, 31, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    roundRect(ctx, -44, 21, 72, 19, 9);
    ctx.fill();

    const tank = ctx.createLinearGradient(-54, -26, -12, 18);
    tank.addColorStop(0, weapon.tankA);
    tank.addColorStop(1, weapon.tankB);
    ctx.fillStyle = tank;
    roundRect(ctx, -54, -25, 44, 38, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(231, 255, 248, 0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = weapon.glow;
    roundRect(ctx, -48, -18, 32, 10, 5);
    ctx.fill();

    const body = ctx.createLinearGradient(-22, -20, 34, 12);
    body.addColorStop(0, weapon.bodyA);
    body.addColorStop(0.52, weapon.bodyB);
    body.addColorStop(1, weapon.bodyC);
    ctx.fillStyle = body;
    roundRect(ctx, -24, -18, 58, 30, 9);
    ctx.fill();

    ctx.fillStyle = "#202730";
    roundRect(ctx, -4, 7, 13, 31, 6);
    ctx.fill();
    ctx.fillStyle = "#ff7b5f";
    roundRect(ctx, -18, 2, 17, 42, 8);
    ctx.fill();

    ctx.strokeStyle = "rgba(16, 19, 22, 0.65)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(2, 10);
    ctx.quadraticCurveTo(15, 19, 4, 30);
    ctx.stroke();

    ctx.fillStyle = "#101316";
    ctx.beginPath();
    ctx.arc(-7, -23, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = weapon.main;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-7, -23, 7, Math.PI * 0.92, Math.PI * 1.92);
    ctx.stroke();

    const barrel = ctx.createLinearGradient(14, -10, 66, 5);
    barrel.addColorStop(0, weapon.main);
    barrel.addColorStop(0.52, weapon.side);
    barrel.addColorStop(1, weapon.core);
    ctx.fillStyle = barrel;
    roundRect(ctx, 14, -9, 54, 14, 7);
    ctx.fill();

    ctx.fillStyle = "#e7fff8";
    roundRect(ctx, 60, -6, 18, 8, 4);
    ctx.fill();
    ctx.fillStyle = sprayActive ? weapon.main : "#9ba7a0";
    roundRect(ctx, 74, -4, 9, 4, 2);
    ctx.fill();

    ctx.restore();
  }

  function drawHand() {
    ctx.save();
    ctx.translate(gun.x - 18, gun.y + 18);
    ctx.fillStyle = "#f0b48f";
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 17, -0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4f7f2";
    roundRect(ctx, -30, 12, 42, 14, 7);
    ctx.fill();
    ctx.restore();
  }

  function drawHose() {
    const weapon = weaponConfig();
    ctx.save();
    ctx.strokeStyle = weapon.glow;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(gun.x - 26, gun.y + 24);
    ctx.bezierCurveTo(gun.x - 78, gun.y + 42, 48, height - 12, -20, height + 16);
    ctx.stroke();
    ctx.strokeStyle = "rgba(231, 255, 248, 0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawPauseVeil() {
    ctx.save();
    ctx.fillStyle = "rgba(16, 19, 22, 0.46)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(244, 247, 242, 0.92)";
    ctx.font = "850 42px Inter, ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("暂停", width / 2, height / 2);
    ctx.restore();
  }

  function roundRect(context, x, y, rectWidth, rectHeight, radius) {
    const r = Math.min(radius, rectWidth / 2, rectHeight / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + rectWidth - r, y);
    context.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + r);
    context.lineTo(x + rectWidth, y + rectHeight - r);
    context.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - r, y + rectHeight);
    context.lineTo(x + r, y + rectHeight);
    context.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
  }

  function getPointer(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp(event.clientX - rect.left, 0, width),
      y: clamp(event.clientY - rect.top, 0, height),
    };
  }

  function moveAim(event) {
    const point = getPointer(event);
    aim.x = point.x;
    aim.y = point.y;
  }

  canvas.addEventListener("pointerdown", (event) => {
    moveAim(event);
    if (state === "idle") {
      startGame();
    } else if (state === "paused") {
      state = "playing";
      updateHud();
    }
    sprayActive = true;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", moveAim);

  canvas.addEventListener("pointerup", (event) => {
    sprayActive = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  });

  canvas.addEventListener("pointercancel", () => {
    sprayActive = false;
  });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  startBtn.addEventListener("click", startGame);
  overlayStartBtn.addEventListener("click", startGame);
  pauseBtn.addEventListener("click", togglePause);
  resetBtn.addEventListener("click", hardReset);
  for (const button of modeButtons) {
    button.addEventListener("click", () => {
      setMode(button.dataset.mode);
    });
  }
  for (const button of weaponButtons) {
    button.addEventListener("click", () => {
      setWeapon(button.dataset.weapon);
    });
  }

  window.addEventListener("keydown", (event) => {
    const keyNudge = 34;
    const numberKey = event.code.startsWith("Digit") ? event.code.slice(5) : event.key;
    if (/^[1-4]$/.test(numberKey)) {
      setWeapon(WEAPON_ORDER[Number(numberKey) - 1]);
      event.preventDefault();
    }
    if (/^[5-7]$/.test(numberKey)) {
      setMode(MODE_ORDER[Number(numberKey) - 5]);
      event.preventDefault();
    }
    if (event.code === "KeyQ") {
      cycleWeapon(-1);
      event.preventDefault();
    }
    if (event.code === "KeyE") {
      cycleWeapon(1);
      event.preventDefault();
    }
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
      keys.left = true;
      gun.targetX -= keyNudge;
      event.preventDefault();
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
      keys.right = true;
      gun.targetX += keyNudge;
      event.preventDefault();
    }
    if (event.code === "ArrowUp" || event.code === "KeyW") {
      keys.up = true;
      gun.targetY -= keyNudge;
      event.preventDefault();
    }
    if (event.code === "ArrowDown" || event.code === "KeyS") {
      keys.down = true;
      gun.targetY += keyNudge;
      event.preventDefault();
    }
    if (event.code === "Space") {
      event.preventDefault();
      togglePause();
    }
    if (event.code === "KeyR") {
      hardReset();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
      keys.left = false;
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
      keys.right = false;
    }
    if (event.code === "ArrowUp" || event.code === "KeyW") {
      keys.up = false;
    }
    if (event.code === "ArrowDown" || event.code === "KeyS") {
      keys.down = false;
    }
  });

  window.addEventListener("resize", setCanvasSize);

  function frame(time) {
    const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
    lastTime = time;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  setCanvasSize();
  resetRound();
  state = "idle";
  updateModeUI();
  updateWeaponUI();
  updateHud();
  requestAnimationFrame(frame);
})();
