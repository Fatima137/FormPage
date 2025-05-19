
import type { LucideIcon } from 'lucide-react';
import {
  BookOpenText,
  Lightbulb,
  Users,
  Tag,
  Store,
  Filter,
  KeyRound,
  Star,
  Gauge,
  BookUser,
  Trophy,
  ShoppingCart,
  PackageCheck,
  Sparkles,
  Wrench,
  Smile,
  Activity,
  CalendarClock,
  MapPin,
  PartyPopper,
  GitCompareArrows,
  Pyramid,
  Brain,
  BarChart3,
  HeartHandshake,
  ShoppingBag,
  Repeat,
  BoxSelect,
  Route,
  MessageSquareText,
  Cpu
} from 'lucide-react';
import type { SurveyQuestion } from '@/ai/flows/suggest-survey-questions';

export interface FollowUpQuestionOption {
  value: string;
  label: string;
  icon?: LucideIcon; // For dropdown options that might need an icon
}
export interface FollowUpQuestionConfig {
  id: string;
  label: string | ((answers: Record<string, string>) => string); // Allow label to be a function
  description?: string;
  type: 'text' | 'textarea' | 'radio' | 'dropdown' | 'number_dropdown' | 'file_upload';
  placeholder?: string | ((answers: Record<string, string>) => string); // Allow placeholder to be a function
  required?: boolean;
  defaultValue?: string;
  options?: FollowUpQuestionOption[];
  showIf?: {
    questionId: string;
    expectedValue: string;
  };
  min?: number; // For number_dropdown or future number inputs
  max?: number; // For number_dropdown or future number inputs
  accept?: string; // For file_upload, to specify accepted file types
}

export interface FrameworkSection {
  title: string;
  icon: LucideIcon;
  description?: string; // Added description field
  exampleQuestions?: SurveyQuestion[];
}

export interface ExploreTemplate {
  id:string;
  title: string;
  description: string;
  Icon: LucideIcon;
  followUpQuestions?: FollowUpQuestionConfig[];
  initialPromptSeed: string;
  frameworkSections: FrameworkSection[];
  isPopular?: boolean;
}

const finalContextQuestion: FollowUpQuestionConfig = {
  id: 'projectBigQuestion',
  label: "What's the big question behind your project?",
  description: "What decision would this research help you make? Any extra context you can share will help us tailor your project to deliver the best results.",
  type: 'textarea',
  placeholder: 'e.g., Should we launch product X? How can we improve our customer retention? What are the key drivers for brand Y in market Z?',
  required: false,
  defaultValue: '',
};

const genericCategoryScreenerQuestions: SurveyQuestion[] = [
    { questionText: "Which, if any, of the following products in the [category] do you typically use?", questionType: "screener", options: ["Product Type A (Screen In)", "Product Type B (Screen In)", "Product Type C", "None of these"] },
    { questionText: "How often do you use products/services in the [category] category nowadays?", questionType: "screener", options: ["Multiple times a day (Screen In)", "Once a day (Screen In)", "A few times a week", "Once a week", "Less than once a week", "Never"] },
];
const genericBrandAwarenessScreenerQuestions: SurveyQuestion[] = [
    { questionText: "Which, if any, of the following brands have you ever heard of in the [category] category?", questionType: "screener", options: ["[Brand X] (Screen In)", "[Brand Y] (Screen In)", "[Competitor Brand Z]", "None of these"] },
];


export const exploreTemplates: ExploreTemplate[] = [
 {
    id: 'motivations',
    title: 'Motivations & frustrations',
    description: 'Gain an understanding of consumer drivers, frustrations, and unmet needs.',
    Icon: Lightbulb,
    isPopular: true,
    frameworkSections: [
      {
        title: 'Screener: Category usage',
        icon: Filter,
        description: "Qualify respondents based on their general category usage.",
        exampleQuestions: [
          { questionText: "Which, if any, of the following [category] do you typically use?", questionType: "screener", options: ["Type A (Screen In)", "Type B (Screen In)", "Type C", "None of these (Screen Out)"] },
          { questionText: "How often do you use [category] nowadays?", questionType: "screener", options: ["Daily (Screen In)", "Weekly", "Monthly", "Rarely", "Never (Screen Out)"] }
        ]
      },
      {
        title: 'Buying Patterns',
        icon: ShoppingCart,
        description: "Understand purchase frequency, planning, and typical buying habits.",
        exampleQuestions: [
          { questionText: "How often do you typically buy [category, product, brand, service]?", questionType: "closedText", options: ["Weekly or more often", "A few times a month", "Once a month", "Every few months", "Less often than every few months"] },
          { questionText: "When you buy [category, product, brand, service], is it usually a planned purchase or more of a spontaneous one?", questionType: "radio", options: [{value: "planned", label: "Mostly planned"}, {value: "spontaneous", label: "Mostly spontaneous"}, {value: "mix", label: "A mix of both"}] }
        ]
      },
      {
        title: 'Product Repertoire',
        icon: BoxSelect,
        description: "Explore the range of products consumers use or consider within the category.",
        exampleQuestions: [
          { questionText: "Which if any of the following [category] products do you currently use?", questionType: "closedText", options: ["[Product A]", "[Product B]", "[Product C]", "[Product D]", "None of these"] },
          { questionText: "Which is the main [category] product you currently use?", questionType: "openText" }
        ]
      },
      {
        title: 'Brand Repertoire',
        icon: Repeat,
        description: "Investigate brand awareness, consideration, and loyalty.",
        exampleQuestions: [
          { questionText: "Which if any of the following [category] brands do you currently use?", questionType: "closedText", options: ["[Brand X]", "[Brand Y]", "[Brand Z]", "[Brand W]", "None of these"] },
          { questionText: "Which is the main [category] brand you currently use?", questionType: "openText" }
        ]
      },
      {
        title: 'Drivers of choice: Product',
        icon: PackageCheck,
        description: "Identify key product attributes and features that drive selection.",
        exampleQuestions: [
          { questionText: "What features do you look for when choosing a product in this category?", questionType: "openText" },
          { questionText: "What made you choose that specific product last time?", questionType: "openText" }
        ]
      },
      {
        title: 'Drivers of choice: Brand',
        icon: Tag,
        description: "Uncover brand-related factors influencing consumer decisions.",
        exampleQuestions: [
          { questionText: "Why do you choose to use your main brand of [category]?", questionType: "openText" },
          { questionText: "What’s important to you when choosing which brand to buy?", questionType: "openText" },
          { questionText: "Why did you choose to buy that specific brand last time?", questionType: "openText" }
        ]
      },
      {
        title: 'Consumption / Usage occasions',
        icon: PartyPopper,
        description: "Explore specific situations or needs that trigger usage.",
        exampleQuestions: [
          { questionText: "What types of occasion do you typically [use / consume] [category, product, brand]?", questionType: "openText" },
          { questionText: "In what occasions do you think this [category, product, brand] is most useful or appropriate?", questionType: "closedText", options: ["Daily use", "Special events", "For work", "For leisure", "To solve a problem"] }
        ]
      },
      {
        title: 'Product Frustrations & Improvements',
        icon: Wrench,
        description: "Uncover pain points and areas for product/service enhancement.",
        exampleQuestions: [
          { questionText: "Is there anything that you don’t like about the [category, product, brand]?", questionType: "openText" },
          { questionText: "What, if anything, would you like to see improved in this [category, product, brand]?", questionType: "openText" }
        ]
      },
      {
        title: 'Channel Repertoire & Preferences', // Standardized title
        icon: Store,
        description: "Map out the shopping channels consumers use and prefer for the category.",
        exampleQuestions: [
          { questionText: "How do you typically buy [category, product, brand, service]?", questionType: "closedText", options: ["Online", "In-store", "Mobile app", "Social media"] },
          { questionText: "Which specific sites do you use to buy [category, product, brand, service]?", questionType: "openText" },
          { questionText: "What is the main site you use to buy [category, product, brand, service]?", questionType: "openText" },
          { questionText: "Which stores do you use to buy [category, product, brand, service]?", questionType: "openText" },
          { questionText: "What is the main store you use to buy [category, product, brand, service]?", questionType: "openText" }
        ]
      },
       {
        title: 'Drivers of choice: Channel',
        icon: Route,
        description: "Identify reasons for preferring certain purchase channels.",
        exampleQuestions: [
          { questionText: "What factors are most important to you when choosing where to buy [category, product, brand]?", questionType: "openText" },
          { questionText: "Why do you choose to buy from your main [purchase channel]? What do you like about buying [category, product, brand] from here?", questionType: "openText" },
          { questionText: "Why do you mainly choose to buy [category, product, brand, service] from that [site, store]?", questionType: "openText" }
        ]
      },
    ],
    followUpQuestions: [
      {
        id: 'motivationFocus',
        label: 'What are you looking to explore?',
        type: 'radio',
        required: true,
        options: [
          { value: 'product', label: 'Usage of a product' },
          { value: 'brand', label: 'Usage of a brand' },
          { value: 'service', label: 'Usage of a service' },
          { value: 'category', label: 'Usage of a category' },
          { value: 'activity', label: 'Behaviours around an activity' }
        ],
      },
      {
        id: 'motivationDescription',
        label: (answers: Record<string, string>) => {
          const focusType = answers['motivationFocus'] || 'item';
          const capitalizedFocusType = focusType.charAt(0).toUpperCase() + focusType.slice(1);
          return `Describe your ${capitalizedFocusType.toLowerCase()}`;
        },
        type: 'textarea',
        placeholder: (answers: Record<string, string>) => {
          const focusType = answers['motivationFocus'];
          if (focusType === 'product') return 'e.g., Our new mobile app for budget tracking.';
          if (focusType === 'brand') return 'e.g., Nike is a global leader in athletic footwear and apparel.';
          if (focusType === 'service') return 'e.g., A new food delivery service and its convenience factors.';
          if (focusType === 'category') return 'e.g., The organic snack food category and consumer preferences within it.';
          if (focusType === 'activity') return 'e.g., Learning a new language online and the challenges involved.';
          return 'e.g., Describe your selection in detail.';
        },
        required: true,
      },
      finalContextQuestion,
    ],
    initialPromptSeed: `You are an expert survey designer. Your task is to generate survey questions to uncover consumer motivations and frustrations regarding the {motivationFocus} described as: "{motivationDescription}".
{{#if projectBigQuestion}}
Additional Project Context / Big Question:
{{{projectBigQuestion}}}
(Use this context to further refine question phrasing, emphasis, and the overall survey flow to better meet the user's underlying research objectives.)
{{/if}}

The survey MUST be structured into the following sections. Each section MUST have a 'sectionTitle', an optional 'sectionDescription', and an array of 'questions'. The section titles MUST BE EXACTLY: ["Screener: Category usage", "Buying Patterns", "Product Repertoire", "Brand Repertoire", "Drivers of choice: Product", "Drivers of choice: Brand", "Consumption / Usage occasions", "Product Frustrations & Improvements", "Channel Repertoire & Preferences", "Drivers of choice: Channel"].

When generating questions for each section:
-   Generate fresh, relevant questions for each section based on the user's input and the section's purpose.
-   If the user has entered a minor typo when describing their {motivationFocus} (e.g., 'coffe maker' instead of 'coffee maker'), use your intuition to infer the correct term. Integrate this corrected term naturally into the questions.
-   For the "Screener: Category usage" section, questions MUST focus on general usage/familiarity with a *broader category* related to '{motivationDescription}' and MUST NOT reveal specific research objectives to avoid bias.
-   For all subsequent sections, questions SHOULD directly address the specific {motivationFocus} '{motivationDescription}'. For example, if {motivationFocus} is 'cars', questions in later sections should ask about 'cars', not 'vehicles'.

General Instructions for all questions:
- Adhere to the 'questionType' and 'options' format as defined in the output schema.
- Ensure a good mix of question types (openText, closedText, scale) within sections.
- Ensure the overall survey is comprehensive yet concise.
- The 'surveyTitle' and 'surveyIntroduction' (which you will also generate as part of the main output object) MUST be vague and NOT reveal the specific {motivationFocus} '{motivationDescription}' to avoid biasing screener responses. For example, if the focus is 'Nike running shoes', title could be 'Your Fitness Gear Opinions', not 'Nike Running Shoe Survey'.
`
  },
  {
    id: 'themes',
    title: 'Themes',
    description: 'Learn how consumers define and engage with topics &amp; themes within your area of focus.',
    Icon: BookOpenText,
    frameworkSections: [
      {
        title: 'Screener: Category usage',
        icon: Filter,
        description: "Qualify respondents based on their interaction with the general category.",
        exampleQuestions: [
          { questionText: "Which, if any, of the following products in the [category] do you typically use?", questionType: "screener", options: ["Product Type A (Screen In)", "Product Type B (Screen In)", "Another Product Type", "None of these"] },
          { questionText: "How often do you use products in the [category] category nowadays?", questionType: "screener", options: ["Daily (Screen In)", "Several times a week (Screen In)", "Once a week", "Less than once a week", "Never"] }
        ]
      },
      {
        title: 'Drivers of choice: Category',
        icon: KeyRound,
        description: "Understand general motivations for choosing products/services in this category.",
        exampleQuestions: [
          { questionText: "What are the main reasons you choose to use products or services in the [category]?", questionType: "openText" },
          {
            questionText: "When deciding between different options in the [category] what do you prioritize most?",
            questionType: "closedText",
            options: ["Price", "Quality", "Brand Reputation", "Specific Features", "Ease of Use", "Recommendations", "Other (please specify)"]
          }
        ]
      },
      {
        title: 'Key benefits & features',
        icon: Star,
        description: "Identify the most valued benefits and features within the category.",
        exampleQuestions: [
          { questionText: "When you are choosing, buying, or using [category], what specific benefits are you looking for?", questionType: "openText" },
          {
            questionText: "Which of the following features is MOST important to you when selecting a product/service in the [category]?",
            questionType: "closedText",
            options: ["Feature A", "Feature B", "Feature C", "Feature D", "Other (please specify)"]
          },
          {
            questionText: "How satisfied are you with the current benefits offered by products/services in the [category] category?",
            questionType: "scale",
            options: ["1 - Very dissatisfied", "2 - Dissatisfied", "3 - Neutral", "4 - Satisfied", "5 - Very satisfied"]
          }
        ]
      },
      {
        title: 'Importance of theme',
        icon: Gauge,
        description: "Assess the personal relevance and impact of the specific theme.",
        exampleQuestions: [
          { questionText: "How important is [theme] to you personally when considering [category] products or services?", questionType: "scale", options: ["1 - Not at all important", "2 - Slightly important", "3 - Moderately important", "4 - Very important", "5 - Extremely important"] },
          { questionText: "In what ways, if any, does [theme] influence your decisions or behavior related to the [category] category?", questionType: "openText" },
          {
            questionText: "To what extent do you agree with the statement: '[theme] plays a significant role in my choice of [category] products/services'?",
            questionType: "closedText",
            options: ["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"]
          }
        ]
      },
      {
        title: 'Consumer definition',
        icon: BookUser,
        description: "Explore how consumers understand and articulate the theme in their own words.",
        exampleQuestions: [
          { questionText: "In your own words, what does [theme] mean to you, especially in the context of the [category]?", questionType: "openText" },
          {
            questionText: "Which of these statements best reflects your understanding of [the theme] as it relates to [category]?",
            questionType: "closedText",
            options: ["Statement A defining the theme (e.g., Theme relates to X)", "Statement B defining the theme (e.g., Theme means Y for me)", "Statement C defining the theme (e.g., Theme involves Z)", "None of these fully capture my understanding"]
          },
           { questionText: "When you hear about [theme] in relation to [category], what are the first few words or phrases that come to mind?", questionType: "openText" },
        ]
      },
      {
        title: 'Winning in the space',
        icon: Trophy,
        description: "Identify best practices and expectations for brands related to the theme.",
        exampleQuestions: [
          { questionText: "Which brands or companies, if any, do you think are doing a good job of addressing or incorporating [theme] within the [category]? Why?", questionType: "openText" },
          {
            questionText: "What are the most important things a brand in the [category] should do to effectively connect with consumers regarding [theme]?",
            questionType: "closedText",
            options: ["Be authentic and transparent", "Offer innovative solutions related to the theme", "Clearly communicate their stance on the theme", "Engage with the community around the theme", "Price products/services fairly in relation to the theme", "Other (please specify)"]
          },
          {
            questionText: "If you were advising a brand in the [category] space on how to 'win' with [theme], what would be your top piece of advice?",
            questionType: "openText"
          }
        ]
      },
    ],
    followUpQuestions: [
      {
        id: 'explorationFocus',
        label: 'What are you looking to explore?',
        type: 'radio',
        required: true,
        options: [
          { value: 'definitions', label: 'Consumer definitions of a theme or trend' },
          { value: 'relevance', label: 'Relevance of a theme or trend in your category' },
          { value: 'alignment', label: 'How to align your brand with a theme or trend' }
        ],
      },
      {
        id: 'themeDescriptionForDefinitions',
        label: 'Describe your theme or trend',
        type: 'textarea',
        placeholder: 'e.g., The rise of minimalist lifestyles and their impact on purchasing decisions.',
        required: true,
        showIf: { questionId: 'explorationFocus', expectedValue: 'definitions' },
      },
      {
        id: 'themeDescriptionForRelevance',
        label: 'Describe your theme or trend',
        type: 'textarea',
        placeholder: 'e.g., The increasing importance of data privacy for online users.',
        required: true,
        showIf: { questionId: 'explorationFocus', expectedValue: 'relevance' },
      },
      {
        id: 'productDescriptionForRelevance',
        label: 'Describe your product or service',
        type: 'textarea',
        placeholder: 'e.g., We offer a subscription box for artisanal coffee.',
        required: true,
        showIf: { questionId: 'explorationFocus', expectedValue: 'relevance' },
      },
      {
        id: 'themeDescriptionForAlignment',
        label: 'Describe your theme or trend',
        type: 'textarea',
        placeholder: 'e.g., The shift towards sustainable and ethically sourced products.',
        required: true,
        showIf: { questionId: 'explorationFocus', expectedValue: 'alignment' },
      },
      {
        id: 'brandDescriptionForAlignment',
        label: 'Describe your brand',
        type: 'textarea',
        placeholder: 'e.g., Our brand is a leader in eco-conscious home goods.',
        required: true,
        showIf: { questionId: 'explorationFocus', expectedValue: 'alignment' },
      },
      finalContextQuestion,
    ],
    initialPromptSeed: `You are an expert survey designer. Your task is to generate survey questions to explore consumer engagement with a specific theme or trend, focusing on {explorationFocus}.
The theme/trend being explored is: '{themeDescription}'.
The context (product/service, brand, or general category) related to this theme is: '{contextDescription}'.
{{#if projectBigQuestion}}
Additional Project Context / Big Question:
{{{projectBigQuestion}}}
(Use this context to further refine question phrasing, emphasis, and the overall survey flow to better meet the user's underlying research objectives.)
{{/if}}

The survey MUST be structured into the following sections. Each section MUST have a 'sectionTitle', an optional 'sectionDescription', and an array of 'questions'. The section titles MUST BE EXACTLY: ["Screener: Category usage", "Drivers of choice: Category", "Key benefits & features", "Importance of theme", "Consumer definition", "Winning in the space"].

When generating questions for each section:
-   Generate fresh, relevant questions for each section based on the user's input and the section's purpose.
-   If the user has entered a minor typo when describing their theme (e.g., 'suustainab' instead of 'sustainability', or 'Natural beaty' instead of 'Natural beauty'), use your intuition to infer the correct term. Integrate this corrected theme naturally into the questions where appropriate, without using inverted commas unless grammatically natural (e.g., "How important is sustainability to you..." not "How important is 'sustainab' to you...").
-   For "Screener: Category usage", "Drivers of choice: Category", and "Key benefits & features" sections, questions MUST NOT mention the specific theme '{themeDescription}' to capture unprompted insights. For example, instead of "What is the most important factor when choosing a product or service related to {themeDescription}?", ask "What is the most important factor when choosing a product or service in this general category?".
-   For "Importance of theme", "Consumer definition", and "Winning in the space" sections, questions SHOULD EXPLICITLY refer to the (potentially corrected) theme '{themeDescription}'.

General Instructions for all questions:
- Adhere to the 'questionType' and 'options' format as defined in the output schema.
- Ensure a good mix of question types (openText, closedText, scale) within prompted sections.
- Ensure the overall survey is comprehensive yet concise.
- The 'surveyTitle' and 'surveyIntroduction' (which you will also generate as part of the main output object) MUST be vague and NOT reveal the specific theme '{themeDescription}' or the detailed nature of '{contextDescription}' to avoid biasing screener responses. For example, if the theme is 'AI in healthcare apps', title could be 'Your Digital Health Opinions' not 'AI Healthcare App Survey'.
`
  },
  {
    id: 'usageExperience',
    title: 'Usage & experience',
    description: 'Understand the when, where, who, why, what and how of the usage of a product or service.',
    Icon: Users,
    frameworkSections: [
      {
        title: 'Screener: Category usage',
        icon: Filter,
        description: "Qualify respondents and understand their general category interaction.",
        exampleQuestions: [
          { questionText: "Which, if any, of the following [category] do you typically use?", questionType: "screener", options: ["Option A (Screen In)", "Option B (Screen In)", "Option C", "None of these (Screen Out)"] },
          { questionText: "How often do you use [category] nowadays?", questionType: "screener", options: ["Daily (Screen In)", "Weekly", "Monthly", "Rarely", "Never (Screen Out)"] }
        ]
      },
      {
        title: 'Usage context: Mood',
        icon: Smile,
        description: "Explore the emotional state of users during interaction.",
        exampleQuestions: [
          { questionText: "How do you typically feel when you are using [category, product, brand]?", questionType: "closedText", options: ["Happy", "Focused", "Relaxed", "Stressed", "Neutral", "Other (please specify)"] },
          { questionText: "Describe the mood you are usually in when you decide to use [category, product, brand].", questionType: "openText" },
        ]
      },
      {
        title: 'Usage context: What (Activity)',
        icon: Activity,
        description: "Identify specific activities or tasks performed.",
        exampleQuestions: [
          { questionText: "What specific tasks or activities do you primarily use [category, product, brand] for?", questionType: "openText" },
          { questionText: "Which of these best describes what you are usually doing when using [category, product, brand]?", questionType: "closedText", options: ["Working", "Relaxing", "Socializing", "Learning", "Shopping", "Other (please specify)"] },
        ]
      },
      {
        title: 'Usage context: When (Time)',
        icon: CalendarClock,
        description: "Determine the timing and frequency of usage.",
        exampleQuestions: [
          { questionText: "At what times of day do you typically use [category, product, brand]?", questionType: "closedText", options: ["Morning", "Afternoon", "Evening", "Late Night", "It varies"] },
          { questionText: "On which days of the week do you most often use [category, product, brand]?", questionType: "openText" },
        ]
      },
      {
        title: 'Usage context: Who With',
        icon: Users,
        description: "Understand the social context of usage (alone or with others).",
        exampleQuestions: [
          { questionText: "Do you usually use [category, product, brand] alone or with other people?", questionType: "closedText", options: ["Mostly alone", "With family", "With friends", "With colleagues", "Other (please specify)"] },
          { questionText: "If you use [category, product, brand] with others, who are they typically?", questionType: "openText" },
        ]
      },
      {
        title: 'Usage context: Where (Location)',
        icon: MapPin,
        description: "Pinpoint common locations or environments for usage.",
        exampleQuestions: [
          { questionText: "Where are you usually located when you use [category, product, brand]?", questionType: "closedText", options: ["At home", "At work/school", "While commuting", "Outdoors", "Public places", "Other (please specify)"] },
          { questionText: "Describe the typical physical environment where you use [category, product, brand].", questionType: "openText" },
        ]
      },
      {
        title: 'Consumption / Usage occasions',
        icon: PartyPopper,
        description: "Deep dive into specific situations that trigger usage.",
        exampleQuestions: [
          { questionText: "What types of occasion do you typically [use / consume] [category, product, brand]?", questionType: "openText" },
          { questionText: "In what occasions do you think this [category, product, brand] is most useful or appropriate?", questionType: "closedText", options: ["Routine tasks", "Problem solving", "Relaxation", "Social events", "Learning/Development", "Other (please specify)"] }
        ]
      },
      {
        title: 'Drivers of choice: Product',
        icon: PackageCheck,
        description: "Uncover product-specific reasons for choosing this option.",
        exampleQuestions: [
          { questionText: "What features do you look for when choosing a product in this category?", questionType: "openText" },
          { questionText: "What made you choose that specific product last time?", questionType: "openText" }
        ]
      },
      {
        title: 'Drivers of choice: Brand',
        icon: Tag,
        description: "Explore brand-related factors influencing the choice.",
        exampleQuestions: [
          { questionText: "What factors are most important to you when choosing which brand of [category] to buy?", questionType: "openText" },
          { questionText: "Why did you choose to buy that specific brand last time?", questionType: "openText" }
        ]
      },
      {
        title: 'Consideration Set & Alternatives',
        icon: GitCompareArrows,
        description: "Identify alternatives and competitive landscape from the user's perspective.",
        exampleQuestions: [
          { questionText: "Which, if any, of the following brands have you ever heard of?", questionType: "closedText", options: ["[Brand A]", "[Brand B]", "[Brand C]", "None of these"] },
          { questionText: "Which, if any, of the following brands have you ever considered using?", questionType: "closedText", options: ["[Brand A]", "[Brand B]", "[Brand C]", "None of these"] },
          { questionText: "Which, if any, of the following brands would you consider using in the future?", questionType: "closedText", options: ["[Brand A]", "[Brand B]", "[Brand C]", "None of these"] },
          { questionText: "Which of the following is your main brand of [category]?", questionType: "openText" }
        ]
      },
    ],
    followUpQuestions: [
      {
        id: 'usageFocusType',
        label: 'What are you looking to explore?',
        type: 'radio',
        required: true,
        options: [
          { value: 'product', label: 'Usage of a product' },
          { value: 'brand', label: 'Usage of a brand' },
          { value: 'service', label: 'Usage of a service' },
          { value: 'category', label: 'Usage of a category' },
        ],
      },
      {
        id: 'usageFocusDescription',
        label: (answers: Record<string, string>) => {
          const focusType = answers['usageFocusType'] || 'item';
          const displayFocusType = focusType.charAt(0).toUpperCase() + focusType.slice(1);
          return `Describe your ${displayFocusType.toLowerCase()}`;
        },
        type: 'textarea',
        placeholder: (answers: Record<string, string>) => {
          const focusType = answers['usageFocusType'];
          if (focusType === 'product') return 'e.g., Our new mobile gaming app.';
          if (focusType === 'brand') return 'e.g., Interacting with the Coca-Cola brand.';
          if (focusType === 'service') return 'e.g., Using a new ride-sharing service for daily commutes.';
          if (focusType === 'category') return 'e.g., Listening habits within the streaming music category.';
          return 'e.g., Describe your selection in detail.';
        },
        required: true,
      },
      {
        id: 'usageUnderstandingDepth',
        label: 'How do you want to understand usage?',
        type: 'radio',
        required: true,
        options: [
          { value: 'broad', label: 'I want to understand broad usage behaviours across all occasions / moments' },
          { value: 'deepDive', label: "I want to deep dive into a specific usage occassion / moments (e.g. 'morning usage occasions' or 'social usage occasions')" },
        ],
      },
      {
        id: 'usageDeepDiveOccasion',
        label: "What is the usage occasion you'd like to deep dive into?",
        type: 'textarea',
        placeholder: 'e.g., Morning commute, Weekend relaxation, Post-workout routines',
        required: true,
        showIf: { questionId: 'usageUnderstandingDepth', expectedValue: 'deepDive' },
      },
      finalContextQuestion,
    ],
    initialPromptSeed: `You are an expert survey designer. Your task is to generate survey questions to understand the usage and experience of the {usageFocusType} "{usageFocusDescription}".
The goal is to {usageAnalysisGoal}.
{{#if projectBigQuestion}}
Additional Project Context / Big Question:
{{{projectBigQuestion}}}
(Use this context to further refine question phrasing, emphasis, and the overall survey flow to better meet the user's underlying research objectives.)
{{/if}}

The survey MUST be structured into the following sections. Each section MUST have a 'sectionTitle', an optional 'sectionDescription', and an array of 'questions'. The section titles MUST BE EXACTLY: ["Screener: Category usage", "Usage context: Mood", "Usage context: What (Activity)", "Usage context: When (Time)", "Usage context: Who With", "Usage context: Where (Location)", "Consumption / Usage occasions", "Drivers of choice: Product", "Drivers of choice: Brand", "Consideration Set & Alternatives"].

When generating questions for each section:
-   Generate fresh, relevant questions for each section based on the user's input and the section's purpose.
-   If the user has entered a minor typo when describing their {usageFocusType} (e.g., 'sreaming music' instead of 'streaming music'), use your intuition to infer the correct term. Integrate this corrected term naturally into the questions.
-   For the "Screener: Category usage" section:
    - Questions MUST focus on general usage/familiarity with a *broader category* related to '{usageFocusDescription}' and MUST NOT reveal the specific research objective '{usageFocusDescription}' too early to avoid bias.
    - **IF** '{usageAnalysisGoal}' indicates a "deep dive into the specific usage occasion of: \\"{usageDeepDiveOccasion}\\"", THEN an additional 'screener' question MUST be included to verify if the respondent has used/experienced '{usageFocusDescription}' during the specific occasion '{usageDeepDiveOccasion}'.
-   For all subsequent sections, questions SHOULD directly address the specific {usageFocusType} '{usageFocusDescription}'. For example, if {usageFocusType} is 'cars', questions in later sections should ask about 'cars', not 'vehicles'.
-   If {usageAnalysisGoal} specifies a deep dive into "{usageDeepDiveOccasion}", the "Consumption / Usage occasions" section should focus heavily on exploring aspects of that specific occasion.

General Instructions for all questions:
- Adhere to the 'questionType' and 'options' format as defined in the output schema.
- Ensure a good mix of question types (openText, closedText, scale) within sections.
- Ensure the overall survey is comprehensive yet concise.
- The 'surveyTitle' and 'surveyIntroduction' (which you will also generate as part of the main output object) MUST be vague and NOT reveal the specific {usageFocusType} '{usageFocusDescription}' to avoid biasing screener responses. For example, if the focus is 'Spotify music streaming', title could be 'Your Media Habits Survey', not 'Spotify Usage Survey'.`
  },
  {
    id: 'brand',
    title: 'Brand',
    description: 'Discover how consumers perceive your brand, uncovering what truly resonates with your audience.',
    Icon: Tag,
    frameworkSections: [
      {
        title: 'Screener: Category usage',
        icon: Filter,
        description: "Identify relevant participants based on their category engagement.",
        exampleQuestions: [
          { questionText: "Which, if any, of the following [category] do you typically use?", questionType: "screener", options: ["Option A (Screen In)", "Option B (Screen In)", "Option C", "None of these (Screen Out)"] },
          { questionText: "How often do you use [category] nowadays?", questionType: "screener", options: ["Daily (Screen In)", "Weekly", "Monthly", "Rarely", "Never (Screen Out)"] }
        ]
      },
      {
        title: 'Screener: Brand awareness',
        icon: Filter,
        description: "Assess awareness of the target brand and key competitors.",
        exampleQuestions: [
          { questionText: "Which, if any, of the following brands have you ever heard of?", questionType: "screener", options: ["[Brand Name] (Screen In)", "[Competitor A]", "[Competitor B]", "None of these (Screen Out)"] }
        ]
      },
      {
        title: 'Brand funnel: Awareness, Consideration, Usage, Preferred',
        icon: Pyramid,
        description: "Map consumer progression through awareness, consideration, usage, and preference.",
        exampleQuestions: [
          { questionText: "Which, if any, of the following brands have you ever heard of?", questionType: "closedText", options: ["[Brand Name]", "[Competitor A]", "[Competitor B]", "Other", "None of these"] },
          { questionText: "Which, if any, of the following brands have you ever considered using?", questionType: "closedText", options: ["[Brand Name]", "[Competitor A]", "[Competitor B]", "Other", "None of these"] },
          { questionText: "Which, if any, of the following brands would you consider using in the future?", questionType: "closedText", options: ["[Brand Name]", "[Competitor A]", "[Competitor B]", "Other", "None of these"] },
          { questionText: "Which of the following is your main brand of [category]?", questionType: "openText" },
        ]
      },
      {
        title: 'Drivers of choice: Brand',
        icon: KeyRound,
        description: "Explore why consumers choose (or don't choose) the target brand.",
        exampleQuestions: [
          { questionText: "Why do you choose to use your main brand of [category]?", questionType: "openText" },
          { questionText: "What's important to you when choosing which brand to buy?", questionType: "openText" },
          { questionText: "Why did you choose to buy that specific brand last time?", questionType: "openText" }
        ]
      },
      {
        title: 'Key benefits & features',
        icon: Star,
        description: "Identify the most valued benefits and features of the brand.",
        exampleQuestions: [
          { questionText: "When choosing / buying / using [category, product, brand], what benefits are you looking for?", questionType: "openText" },
          { questionText: "What feature is MOST important to you when choosing a [category, product, brand]?", questionType: "closedText", options: ["Feature X", "Feature Y", "Feature Z", "Other"] },
          { questionText: "What specific benefits or impact would you be hoping to get from using [category, product, brand]?", questionType: "openText" }
        ]
      },
      {
        title: 'Perception of brand',
        icon: Brain,
        description: "Uncover spontaneous associations and detailed perceptions of the brand.",
        exampleQuestions: [
          { questionText: "Which best describes your feelings towards this brand?", questionType: "scale", options: ["1 - Very Negative", "3 - Neutral", "5 - Very Positive"] },
          { questionText: "What, if anything, do you like about this brand?", questionType: "openText" },
          { questionText: "Is there anything you don't like about this brand?", questionType: "openText" },
          { questionText: "In your opinion what do you think this brand stands for?", questionType: "openText" },
          { questionText: "If this brand came to life as a person, what would they be like?", questionType: "openText" },
        ]
      },
      {
        title: 'Winning in the space',
        icon: Trophy,
        description: "Identify what the brand needs to do to succeed against competitors.",
        exampleQuestions: [
          { questionText: "Which brand do you think does this best right now?", questionType: "openText" },
          { questionText: "What is it that the best brands get right in this space?", questionType: "openText" },
          { questionText: "If you were a brand trying to do well in this category, what would you focus on?", questionType: "openText" }
        ]
      },
      {
        title: 'Key Brand Metrics',
        icon: BarChart3,
        description: "Measure the brand against specific key performance indicators.",
        exampleQuestions: [
          { questionText: "How would you rate this brand in terms of quality?", questionType: "scale", options: ["1 - Very Poor", "3 - Average", "5 - Excellent"] },
          { questionText: "How would you rate this brand in terms of sustainability?", questionType: "scale", options: ["1 - Very Poor", "3 - Average", "5 - Excellent"] },
          { questionText: "How would you rate this brand in terms of being innovative?", questionType: "scale", options: ["1 - Very Poor", "3 - Average", "5 - Excellent"] }
        ]
      },
    ],
    followUpQuestions: [
      {
        id: 'brandDescription',
        label: 'Describe your brand in a sentence or two',
        type: 'textarea',
        placeholder: 'e.g., Nike is a global leader in athletic footwear, apparel, and equipment.',
        required: true,
      },
      {
        id: 'brandCategory',
        label: 'Describe the category your brand sits in in a sentence or two',
        type: 'textarea',
        placeholder: (answers: Record<string, string>) => {
          const brandInput = answers['brandDescription'] || "your brand";
          const brandWords = brandInput.split(' ');
          const brandName = brandWords[0] ? brandWords[0].replace(/[,.]/g, '') : "YourBrand";
          return `e.g., If ${brandName} is Nike, the category is athletic footwear and apparel. If ${brandName} is Apple, it's consumer electronics.`;
        },
        required: true,
      },
      {
        id: 'brandCompetitors',
        label: "Describe the competitors you'd want to compare your brand against? (optional)",
        type: 'textarea',
        placeholder: 'e.g., Adidas, Puma, Under Armour, New Balance',
        required: false,
      },
      {
        id: 'brandKeyMetrics',
        label: 'What key metrics would you like to measure brand perception against? (optional)',
        type: 'textarea',
        placeholder: 'e.g., Trust, innovation, quality, value for money, customer service, sustainability',
        required: false,
      },
      finalContextQuestion,
    ],
    initialPromptSeed: `You are an expert survey designer. Your task is to generate survey questions to discover consumer perceptions of the brand described as '{brandDescription}', which operates in the category '{brandCategory}'. The aim is to uncover what truly resonates with its audience. If competitors are specified (e.g., '{brandCompetitors}'), include questions that help understand the brand's positioning against them. If key metrics for perception are specified (e.g., '{brandKeyMetrics}'), include questions to measure these aspects.
{{#if projectBigQuestion}}
Additional Project Context / Big Question:
{{{projectBigQuestion}}}
(Use this context to further refine question phrasing, emphasis, and the overall survey flow to better meet the user's underlying research objectives.)
{{/if}}

The survey MUST be structured into the following sections. Each section MUST have a 'sectionTitle', an optional 'sectionDescription', and an array of 'questions'. The section titles MUST BE EXACTLY: ["Screener: Category usage", "Screener: Brand awareness", "Brand funnel: Awareness, Consideration, Usage, Preferred", "Drivers of choice: Brand", "Key benefits & features", "Perception of brand", "Winning in the space", "Key Brand Metrics"].

When generating questions for each section:
-   Generate fresh, relevant questions for each section based on the user's input and the section's purpose.
-   If the user has entered a minor typo when describing their brand (e.g., 'Nkie' instead of 'Nike'), use your intuition to infer the correct term. Integrate this corrected term naturally into the questions.
-   For "Screener: Category usage" and "Screener: Brand awareness" sections, questions MUST focus on general category familiarity and brand awareness without revealing deeper research objectives too early.
-   For all subsequent sections, questions SHOULD directly address the specific brand '{brandDescription}' and its context.

General Instructions for all questions:
- Adhere to the 'questionType' and 'options' format as defined in the output schema.
- Ensure a good mix of question types (openText, closedText, scale) within sections.
- Ensure the overall survey is comprehensive yet concise.
- The 'surveyTitle' and 'surveyIntroduction' (which you will also generate as part of the main output object) MUST be vague and NOT reveal the specific brand '{brandDescription}' or '{brandCategory}' to avoid biasing screener responses.`
  },
  {
    id: 'shoppersPurchases',
    title: 'Shoppers & purchases',
    description: 'Explore purchase behaviour, unlocking channel choice drivers and shopper experience.',
    Icon: Store,
    frameworkSections: [
      {
        title: 'Screener: Category purchase',
        icon: Filter,
        description: "Qualify respondents based on recent category purchases.",
        exampleQuestions: [
          { questionText: "Which, if any, of the following categories have you bought in the past 3 months?", questionType: "screener", options: ["[Category A] (Screen In)", "[Category B]", "[Category C]", "None of these (Screen Out)"] }
        ]
      },
      {
        title: 'Purchase context: What',
        icon: ShoppingCart,
        description: "Understand the specific items purchased during a shopping trip.",
        exampleQuestions: [
          { questionText: "Please tell us everything you bought during that shopping trip from the [category] category.", questionType: "openText" }
        ]
      },
      {
        title: 'Drivers of choice: Product',
        icon: PackageCheck,
        description: "Identify key product attributes influencing purchase decisions.",
        exampleQuestions: [
          { questionText: "What features do you look for when choosing a product in this category?", questionType: "openText" },
          { questionText: "What made you choose that specific product last time?", questionType: "openText" }
        ]
      },
      {
        title: 'Drivers of choice: Brand',
        icon: Tag,
        description: "Explore brand-related factors that drive purchase choices.",
        exampleQuestions: [
          { questionText: "What factors are most important to you when choosing which brand of [category] to buy?", questionType: "openText" },
          { questionText: "Why did you choose to buy that specific brand last time?", questionType: "openText" }
        ]
      },
      {
        title: 'Purchase context: When',
        icon: CalendarClock,
        description: "Determine the timing and day of the week for purchases.",
        exampleQuestions: [
          { questionText: "When you last bought [category, product, brand] — what day of the week was it?", questionType: "closedText", options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
          { questionText: "What time of day did you last shop for [category, product, brand]?", questionType: "closedText", options: ["Morning", "Afternoon", "Evening"] }
        ]
      },
      {
        title: 'Purchase context: Who with',
        icon: Users,
        description: "Understand if purchases are made alone or with others.",
        exampleQuestions: [
          { questionText: "Who were you with last time you shopped for [category, product, brand]?", questionType: "closedText", options: ["Alone", "With partner/spouse", "With family", "With friends", "With children"] },
          { questionText: "Including yourself, how many people were you with when you bought [category, product, brand]?", questionType: "openText" }
        ]
      },
      {
        title: 'Purchase context: Where',
        icon: MapPin,
        description: "Identify the physical location of purchase if applicable.",
        exampleQuestions: [
          { questionText: "Where were you the last time you bought [category, product, brand]?", questionType: "closedText", options: ["At home (online)", "At work (online)", "In a physical store", "While commuting (mobile)", "Other"] }
        ]
      },
      {
        title: 'Purchase context: Channel',
        icon: Store,
        description: "Explore the specific channels used for purchasing (online/offline, store/site).",
        exampleQuestions: [
          { questionText: "When you last bought [category, product, brand], how did you do it?", questionType: "closedText", options: ["In a physical store", "Online via website", "Online via mobile app", "Other"] },
          { questionText: "Which best describes the type of store you bought it from?", questionType: "openText" },
          { questionText: "Which best describes the type of site you bought it from?", questionType: "openText" },
          { questionText: "Please tell us the name of the store / site that you bought it from", questionType: "openText" }
        ]
      },
      {
        title: 'Purchase context: Type of Shopping Trip',
        icon: ShoppingBag,
        description: "Understand the nature of the shopping trip (e.g., routine, specific mission).",
        exampleQuestions: [
          { questionText: "When you bought [category, product, brand], which best describes the type of shopping trip?", questionType: "closedText", options: ["Routine grocery shop", "Specific item purchase", "Browsing/Impulse buy", "Gift shopping", "Emergency purchase"] },
          { questionText: "When you bought [category, product, brand], was it a planned purchase or more spontaneous?", questionType: "radio", options: [{value: "planned", label: "Planned"}, {value: "spontaneous", label: "Spontaneous"}, {value: "mix", label: "A mix"}] }
        ]
      },
      {
        title: 'Drivers of choice: Channel',
        icon: Route,
        description: "Identify reasons for choosing particular shopping channels.",
        exampleQuestions: [
          { questionText: "What factors are most important to you when choosing where to buy [category, product, brand]?", questionType: "openText" },
          { questionText: "Why do you choose to buy from your main [purchase channel]? What do you like about buying [category, product, brand] from here?", questionType: "openText" },
          { questionText: "Why do you mainly choose to buy [category, product, brand, service] from that [site, store]?", questionType: "openText" },
          { questionText: "What makes this the best choice for you?", questionType: "openText" }
        ]
      },
    ],
    followUpQuestions: [
      {
        id: 'shoppingPatternFocus',
        label: 'What are you looking to explore?',
        type: 'radio',
        required: true,
        options: [
          { value: 'product', label: 'Shopping and purchase patterns of a product' },
          { value: 'service', label: 'Shopping and purchase patterns of a service' },
          { value: 'category', label: 'Shopping and purchase patterns within a category' },
          { value: 'brand', label: 'Shopping and purchase patterns of a brand' },
        ],
      },
      {
        id: 'shoppingPatternDescription',
        label: (answers: Record<string, string>) => {
          const focusType = answers['shoppingPatternFocus'] || 'item';
          const capitalizedFocusType = focusType.charAt(0).toUpperCase() + focusType.slice(1);
          return `Describe your ${capitalizedFocusType.toLowerCase()}`;
        },
        type: 'textarea',
        placeholder: (answers: Record<string, string>) => {
            const focusType = answers['shoppingPatternFocus'];
            if (focusType === 'product') return 'e.g., Smart home devices like voice assistants or smart lighting.';
            if (focusType === 'service') return 'e.g., Online grocery delivery services and their user adoption trends.';
            if (focusType === 'category') return 'e.g., The sustainable fashion category and how consumers make choices within it.';
            if (focusType === 'brand') return 'e.g., Shopping for Apple products versus competitor brands.';
            return 'e.g., Describe your selection in detail.';
        },
        required: true,
      },
      {
        id: 'shoppingBehaviorDepth',
        label: 'How do you want to understand shopping behavior?',
        type: 'radio',
        required: true,
        options: [
          { value: 'broad', label: 'Understand broad shopping behaviours across all shopper missions' },
          { value: 'deepDive', label: 'Deep dive into a specific shopper mission' },
        ],
      },
      {
        id: 'shopperMissionDeepDive',
        label: "What is the shopper mission you'd like to deep dive into?",
        type: 'textarea',
        placeholder: 'e.g., Bargain hunting, researching high-value items, weekly grocery stock-up',
        required: true,
        showIf: { questionId: 'shoppingBehaviorDepth', expectedValue: 'deepDive' },
      },
      {
        id: 'shoppingBehaviorTypeInterest',
        label: 'What type of shopping behaviour are you interested in?',
        type: 'radio',
        required: true,
        options: [
          { value: 'online', label: 'Online shopping' },
          { value: 'offline', label: 'Offline shopping (in-store)' },
          { value: 'omnichannel', label: 'Omni-channel (both online and offline)' },
        ],
      },
      finalContextQuestion,
    ],
    initialPromptSeed: `You are an expert survey designer. Your task is to generate survey questions to explore shopping behavior.
The focus is on {shoppingPatternFocus} described as '{shoppingPatternDescription}'.
Understanding depth should be {shoppingBehaviorDepth}.
Specific mission (if applicable): '{shopperMissionDeepDive}'.
Type of shopping behavior interested in: {shoppingBehaviorTypeInterest}.
The goal is to unlock consumer preferences, channel choice drivers, and the overall shopper experience.
{{#if projectBigQuestion}}
Additional Project Context / Big Question:
{{{projectBigQuestion}}}
(Use this context to further refine question phrasing, emphasis, and the overall survey flow to better meet the user's underlying research objectives.)
{{/if}}

The survey MUST be structured into the following sections. Each section MUST have a 'sectionTitle', an optional 'sectionDescription', and an array of 'questions'. The section titles MUST BE EXACTLY: ["Screener: Category purchase", "Purchase context: What", "Drivers of choice: Product", "Drivers of choice: Brand", "Purchase context: When", "Purchase context: Who with", "Purchase context: Where", "Purchase context: Channel", "Purchase context: Type of Shopping Trip", "Drivers of choice: Channel"].

When generating questions for each section:
-   Generate fresh, relevant questions for each section based on the user's input and the section's purpose.
-   If the user has entered a minor typo when describing their {shoppingPatternFocus} (e.g., 'fashon' instead of 'fashion'), use your intuition to infer the correct term. Integrate this corrected term naturally into the questions.
-   For the "Screener: Category purchase" section, questions MUST focus on general purchase/familiarity with the *broader category* of '{shoppingPatternDescription}' and MUST NOT mention the specific '{shoppingPatternDescription}' itself.
-   For all subsequent sections, questions should directly address the specific '{shoppingPatternDescription}'.

General Instructions for all questions:
- Adhere to the 'questionType' and 'options' format as defined in the output schema.
- Ensure a good mix of question types (openText, closedText, scale) within sections.
- Ensure the overall survey is comprehensive yet concise.
- The 'surveyTitle' and 'surveyIntroduction' (which you will also generate as part of the main output object) MUST be vague and NOT reveal the specific '{shoppingPatternDescription}' to avoid biasing screener responses.`
  },
];

    