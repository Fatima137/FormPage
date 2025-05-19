
import {
  Filter, Smile, ThumbsUp, ListChecks, Search, ShoppingCart, Tag, Heart, KeyRound, Star, Gauge, BookUser, Trophy,
  BoxSelect, Repeat, PartyPopper, Wrench, Store, Route, Activity, CalendarClock, Users, MapPin, GitCompareArrows, Pyramid,
  Brain, BarChart3, HeartHandshake, ShoppingBag, ZoomIn, Package, MessageSquareText, Edit3, UsersRound, CircleHelp, Sparkles, SearchCheck, Palette, Settings2, PlusCircle, Puzzle,
  Lightbulb, Cpu
} from 'lucide-react';
import type { FrameworkSection } from './exploreTemplates';
import type { SurveyQuestion } from '@/ai/flows/suggest-survey-questions';

// Helper to create generic example questions - keeps the main definitions cleaner
const createExampleQuestions = (title: string, isScreenerQuestionText?: string): SurveyQuestion[] => {
  if (isScreenerQuestionText) {
    // For screeners where the description *is* the question, the example can be about its options
    return [
      {
        questionText: isScreenerQuestionText, // Use the provided question text
        questionType: 'closedText', // Default to closedText for screeners needing options
        options: [`[Option for ${title} 1]`, `[Option for ${title} 2]`, `[Option for ${title} 3]`, `None of these`]
      }
    ];
  }
  return [
    { questionText: `What are your thoughts on ${title.toLowerCase()}?`, questionType: 'openText' },
    {
      questionText: `How would you rate your overall experience with ${title.toLowerCase()}?`,
      questionType: 'scale',
      options: ['1 - Very Poor', '2 - Poor', '3 - Neutral', '4 - Good', '5 - Very Good']
    },
    {
      questionText: `Which of the following best describes your primary use of ${title.toLowerCase()}?`,
      questionType: 'closedText',
      options: ['Option A', 'Option B', 'Option C', 'Other (please specify)']
    }
  ];
};


export const commonSurveySections: FrameworkSection[] = [
  // Existing common screeners
  { title: 'Screener: Category usage', icon: Filter, description: "Qualify respondents based on their general interaction with the category.", exampleQuestions: createExampleQuestions('Category Usage Screening') },
  { title: 'Screener: Product Ownership', icon: Filter, description: "Filter for users who own or have experience with specific products.", exampleQuestions: createExampleQuestions('Product Ownership Screening') },
  { title: 'Screener: General Qualification', icon: Filter, description: "General questions to qualify or segment respondents before concept exposure.", exampleQuestions: createExampleQuestions('General Qualification Screening') },

  // New Screeners based on user request
  {
    title: 'Screener: Brand usage',
    icon: Filter,
    description: "Which, if any, of the following brands do you use nowadays?",
    exampleQuestions: createExampleQuestions('Brand usage', "Which, if any, of the following brands do you use nowadays?")
  },
  {
    title: 'Screener: Brand awareness',
    icon: Filter,
    description: "Which, if any, of the following brands have you ever heard of before today?",
    exampleQuestions: createExampleQuestions('Brand awareness', "Which, if any, of the following brands have you ever heard of before today?")
  },
  {
    title: 'Screener: Brand consideration',
    icon: Filter,
    description: "Which, if any, of the following brands would you consider buying in future?",
    exampleQuestions: createExampleQuestions('Brand consideration', "Which, if any, of the following brands would you consider buying in future?")
  },
  {
    title: 'Screener: Brand non-rejector',
    icon: Filter,
    description: "Are there any of the following brands that you would never consider buying?",
    exampleQuestions: createExampleQuestions('Brand non-rejector', "Are there any of the following brands that you would never consider buying?")
  },
  {
    title: 'Screener: Activity',
    icon: Filter,
    description: "Which, if any, of the following activities do you take part in nowadays?",
    exampleQuestions: createExampleQuestions('Activity', "Which, if any, of the following activities do you take part in nowadays?")
  },
  {
    title: 'Screener: Decision maker',
    icon: Filter,
    description: "Which best describes your role when it comes to choosing which [category, product, brand, service] to buy?",
    exampleQuestions: createExampleQuestions('Decision maker', "Which best describes your role when it comes to choosing which [category, product, brand, service] to buy?")
  },
  {
    title: 'Screener: Category purchase',
    icon: Filter,
    description: "Which, if any, of the following categories have you bought in the last month?",
    exampleQuestions: createExampleQuestions('Category purchase', "Which, if any, of the following categories have you bought in the last month?")
  },
  {
    title: 'Screener: Brand purchase',
    icon: Filter,
    description: "Which, if any, of the following brands have you bought in the last month?",
    exampleQuestions: createExampleQuestions('Brand purchase', "Which, if any, of the following brands have you bought in the last month?")
  },
  {
    title: 'Screener: Purchase channel usage',
    icon: Filter,
    description: "Where have you shopped for [category, product, brand] in the last month?",
    exampleQuestions: createExampleQuestions('Purchase channel usage', "Where have you shopped for [category, product, brand] in the last month?")
  },

  // Existing common non-screener sections
  { title: 'Demographics', icon: UsersRound, description: "Collect standard demographic information like age, gender, location, etc.", exampleQuestions: createExampleQuestions('Demographics') },
  { title: 'Final Comments & Feedback', icon: Edit3, description: "Provide an open-ended opportunity for any additional thoughts or feedback.", exampleQuestions: createExampleQuestions('Final Comments') },
];

export const engagementSections: FrameworkSection[] = [
  { title: 'Overall Satisfaction', icon: Smile, description: "Gauge overall happiness and contentment with the subject.", exampleQuestions: createExampleQuestions('Overall Satisfaction') },
  { title: 'Product Appeal', icon: ThumbsUp, description: "Assess the general attractiveness and desirability of the product.", exampleQuestions: createExampleQuestions('Product Appeal') },
  { title: 'Feature Importance & Satisfaction', icon: ListChecks, description: "Evaluate which features are most important and how satisfied users are with them.", exampleQuestions: createExampleQuestions('Feature Importance') },
  { title: 'Unmet Needs & Pain Points', icon: CircleHelp, description: "Identify challenges, frustrations, and opportunities for improvement.", exampleQuestions: createExampleQuestions('Unmet Needs') },
  { title: 'Purchase Intent', icon: ShoppingCart, description: "Measure the likelihood of future purchase or adoption.", exampleQuestions: createExampleQuestions('Purchase Intent') },
  { title: 'Emotional Drivers', icon: Heart, description: "Explore the feelings and emotions that influence decisions and engagement.", exampleQuestions: createExampleQuestions('Emotional Drivers') },
];

export const brandAndMarketSections: FrameworkSection[] = [
  { title: 'Brand Perception', icon: Tag, description: "Understand how consumers view and feel about the brand.", exampleQuestions: createExampleQuestions('Brand Perception') },
  { title: 'Brand funnel: Awareness, Consideration, Usage, Preferred', icon: Pyramid, description: "Track consumer progression from awareness to loyalty for the brand.", exampleQuestions: createExampleQuestions('Brand Funnel') },
  { title: 'Key Brand Metrics', icon: BarChart3, description: "Measure core brand health indicators and performance.", exampleQuestions: createExampleQuestions('Key Brand Metrics') },
  { title: 'Brand Purpose & Values Alignment', icon: HeartHandshake, description: "Assess if the brand's mission and values resonate with consumers.", exampleQuestions: createExampleQuestions('Brand Values Alignment') },
  { title: 'Winning in the space', icon: Trophy, description: "Identify strategies and attributes of successful brands in the category.", exampleQuestions: createExampleQuestions('Winning in the Space') },
  { title: 'Competitor Comparison', icon: GitCompareArrows, description: "Understand how the brand stacks up against its main competitors.", exampleQuestions: createExampleQuestions('Competitor Comparison') },
  { title: 'Perception of brand', icon: Brain, description: "Uncover spontaneous associations and detailed perceptions of the brand.", exampleQuestions: createExampleQuestions('Brand Perception Details') },
];

export const usageAndBehaviorSections: FrameworkSection[] = [
  { title: 'Drivers of choice: Category', icon: KeyRound, description: "Uncover motivations for engaging with the overall category.", exampleQuestions: createExampleQuestions('Category Drivers') },
  { title: 'Drivers of choice: Product', icon: Package, description: "Identify specific product attributes that influence selection.", exampleQuestions: createExampleQuestions('Product Drivers') },
  { title: 'Drivers of choice: Brand', icon: Tag, description: "Explore brand-related factors that drive consumer preference.", exampleQuestions: createExampleQuestions('Brand Drivers') },
  { title: 'Drivers of choice: Channel', icon: Route, description: "Understand why consumers choose certain channels for purchase or interaction.", exampleQuestions: createExampleQuestions('Channel Drivers') },
  { title: 'Key benefits & features', icon: Star, description: "Determine the most desired benefits and features users look for.", exampleQuestions: createExampleQuestions('Key Benefits') },
  { title: 'Consumer definition', icon: BookUser, description: "Explore how consumers articulate and understand a specific theme or concept.", exampleQuestions: createExampleQuestions('Theme Definition') },
  { title: 'Importance of theme', icon: Gauge, description: "Assess the personal relevance and impact of a theme or concept.", exampleQuestions: createExampleQuestions('Theme Importance') },
  { title: 'Buying Patterns', icon: ShoppingCart, description: "Understand purchase frequency, planning, and typical buying habits.", exampleQuestions: createExampleQuestions('Buying Patterns') },
  { title: 'Product Repertoire', icon: BoxSelect, description: "Explore the range of products consumers use or consider within the category.", exampleQuestions: createExampleQuestions('Product Repertoire') },
  { title: 'Brand Repertoire', icon: Repeat, description: "Investigate brand awareness, consideration, and loyalty within the category.", exampleQuestions: createExampleQuestions('Brand Repertoire') },
  { title: 'Consumption / Usage occasions', icon: PartyPopper, description: "Explore specific situations or needs that trigger product/service usage.", exampleQuestions: createExampleQuestions('Usage Occasions') },
  { title: 'Product Frustrations & Improvements', icon: Wrench, description: "Identify pain points and gather suggestions for product/service enhancement.", exampleQuestions: createExampleQuestions('Product Frustrations') },
  { title: 'Channel Repertoire & Preferences', icon: Store, description: "Map out the shopping channels consumers use and prefer for the category.", exampleQuestions: createExampleQuestions('Channel Repertoire') },
  { title: 'Usage context: Mood', icon: Smile, description: "Explore the emotional state or mood of users during interaction.", exampleQuestions: createExampleQuestions('Usage Mood') },
  { title: 'Usage context: What (Activity)', icon: Activity, description: "Identify specific activities or tasks performed with the product/service.", exampleQuestions: createExampleQuestions('Usage Activity') },
  { title: 'Usage context: When (Time)', icon: CalendarClock, description: "Determine the timing, day, and frequency of usage.", exampleQuestions: createExampleQuestions('Usage Time') },
  { title: 'Usage context: Who With', icon: Users, description: "Understand the social context: whether usage is solitary or with others.", exampleQuestions: createExampleQuestions('Usage Company') },
  { title: 'Usage context: Where (Location)', icon: MapPin, description: "Pinpoint common physical or virtual locations for usage.", exampleQuestions: createExampleQuestions('Usage Location') },
  { title: 'Consideration Set & Alternatives', icon: GitCompareArrows, description: "Identify what alternatives consumers consider or use instead.", exampleQuestions: createExampleQuestions('Consideration Set') },
  { title: 'Purchase Context: What Purchased', icon: ShoppingCart, description: "Detail the specific items bought during a shopping trip.", exampleQuestions: createExampleQuestions('Items Purchased') },
  { title: 'Purchase Context: Type of Shopping Trip', icon: ShoppingBag, description: "Understand the nature of the shopping trip (e.g., routine, specific mission, impulse).", exampleQuestions: createExampleQuestions('Shopping Trip Type') },
  { title: 'Purchase context: What', icon: ShoppingCart, description: "Understand the specific items purchased during a shopping trip.", exampleQuestions: createExampleQuestions('Purchase Context What') },
  { title: 'Purchase context: When', icon: CalendarClock, description: "Determine the timing and day of the week for purchases.", exampleQuestions: createExampleQuestions('Purchase Context When') },
  { title: 'Purchase context: Who with', icon: Users, description: "Understand if purchases are made alone or with others.", exampleQuestions: createExampleQuestions('Purchase Context Who With') },
  { title: 'Purchase context: Where', icon: MapPin, description: "Identify the physical location of purchase if applicable.", exampleQuestions: createExampleQuestions('Purchase Context Where') },
  { title: 'Purchase context: Channel', icon: Store, description: "Explore the specific channels used for purchasing (online/offline, store/site).", exampleQuestions: createExampleQuestions('Purchase Context Channel') },
];

export const conceptTestingSections: FrameworkSection[] = [
    { title: 'Concept Introduction & Stimulus Exposure', icon: Palette, description: "Present the concept or stimulus clearly to respondents.", exampleQuestions: createExampleQuestions('Concept Introduction') },
    { title: 'Overall Concept Evaluation', icon: ZoomIn, description: "Gather initial overall reactions and appeal of the concept.", exampleQuestions: createExampleQuestions('Concept Evaluation') },
    { title: 'Clarity & Understanding of Concept', icon: SearchCheck, description: "Assess how well respondents comprehend the presented concept.", exampleQuestions: createExampleQuestions('Concept Clarity') },
    { title: 'Likes & Dislikes of Concept', icon: ThumbsUp, description: "Identify specific aspects of the concept that resonate positively or negatively.", exampleQuestions: createExampleQuestions('Concept Likes/Dislikes') },
    { title: 'Uniqueness & Differentiation of Concept', icon: Sparkles, description: "Evaluate how distinct and novel the concept is perceived to be.", exampleQuestions: createExampleQuestions('Concept Uniqueness') },
    { title: 'Believability & Relevance of Concept', icon: HeartHandshake, description: "Gauge the credibility of the concept and its personal relevance to respondents.", exampleQuestions: createExampleQuestions('Concept Believability') },
    { title: 'Purchase Intent for Concept', icon: ShoppingCart, description: "Measure the likelihood of respondents purchasing or using the concept if available.", exampleQuestions: createExampleQuestions('Concept Purchase Intent') },
];

// Add some more generic sections that could be useful for various survey types
export const additionalGenericSections: FrameworkSection[] = [
  { title: 'Attitudes & Opinions', icon: MessageSquareText, description: "Explore general attitudes towards a topic or category.", exampleQuestions: createExampleQuestions('General Attitudes') },
  { title: 'Lifestyle & Habits', icon: Activity, description: "Understand respondent lifestyles relevant to the survey context.", exampleQuestions: createExampleQuestions('Lifestyle Habits') },
  { title: 'Future Expectations', icon: Lightbulb, description: "Gather thoughts on future trends or desires related to the topic.", exampleQuestions: createExampleQuestions('Future Expectations') },
  { title: 'Media Consumption', icon: Search, description: "Understand media habits relevant for communication strategies.", exampleQuestions: createExampleQuestions('Media Consumption') },
  { title: 'Technology Usage', icon: Cpu, description: "Assess familiarity and usage of relevant technologies.", exampleQuestions: createExampleQuestions('Technology Usage') },
];


export const allAvailableSurveySections: FrameworkSection[] = [
  ...commonSurveySections,
  ...engagementSections,
  ...brandAndMarketSections,
  ...usageAndBehaviorSections,
  ...conceptTestingSections,
  ...additionalGenericSections,
].filter((section, index, self) => // Deduplicate by title
  index === self.findIndex((s) => s.title === section.title)
).sort((a,b) => a.title.localeCompare(b.title)); // Sort alphabetically for consistent display


export const allAvailableScreenerSections: FrameworkSection[] = commonSurveySections
  .filter(section => section.title.toLowerCase().startsWith('screener:'))
  .sort((a,b) => a.title.localeCompare(b.title));

// Ensure all sections have example questions.
// The createExampleQuestions helper already does this.

    

    