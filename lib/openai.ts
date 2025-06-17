import OpenAI from 'openai'

export interface StoryPage {
  pageNumber: number
  text: string
  imageDescription: string
}

export interface GeneratedStory {
  title: string
  pages: StoryPage[]
  totalPages: number
}

export async function generateChildrenStory(
  childProfiles: any[],
  theme: string,
  qualities: string[],
  magicalDetails: string,
  specialMemories: string,
  narrativeStyle: string
): Promise<GeneratedStory> {
  
  // Initialize OpenAI client inside the function
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  
  // Construct character descriptions
  const characterDescriptions = childProfiles.map(profile => {
    let desc = `${profile.name} (${profile.gender || 'child'})`
    if (profile.appearance) {
      const appearance = []
      if (profile.appearance.hairColor) appearance.push(`${profile.appearance.hairColor} hair`)
      if (profile.appearance.eyeColor) appearance.push(`${profile.appearance.eyeColor} eyes`)
      if (appearance.length > 0) desc += ` with ${appearance.join(' and ')}`
    }
    if (profile.special_traits) desc += `. Special traits: ${profile.special_traits}`
    if (profile.favorite_thing) desc += `. Loves: ${profile.favorite_thing}`
    return desc
  }).join('\n')

  const qualitiesList = qualities.length > 0 ? qualities.join(', ') : 'kindness, bravery, curiosity'

  const prompt = `Create a magical children's picture book story with the following specifications:

CHARACTERS:
${characterDescriptions}

STORY REQUIREMENTS:
- Theme: ${theme}
- Focus on these qualities: ${qualitiesList}
- Magical elements: ${magicalDetails}
- Include these special memories/elements: ${specialMemories}
- Narrative style: ${narrativeStyle}

BOOK SPECIFICATIONS:
- Target age: 3-8 years old
- Total pages: 8-12 pages
- Each page should have 1-3 sentences (20-60 words per page)
- Story should be educational, teaching about ${qualitiesList}
- Include adventure, friendship, and positive messages
- Language should be simple but engaging
- Each page needs a detailed image description for illustration

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Story Title",
  "pages": [
    {
      "pageNumber": 1,
      "text": "Page text content (1-3 sentences, 20-60 words)",
      "imageDescription": "Detailed description of what should be illustrated on this page, including character positions, setting, expressions, and visual details"
    }
  ],
  "totalPages": 8
}

STORY GUIDELINES:
- Start with introducing the character(s) in their normal world
- Present a gentle conflict or adventure opportunity
- Show the character(s) using the specified qualities to overcome challenges
- Include the magical elements naturally in the story
- End with a positive resolution and lesson learned
- Make sure each page flows naturally to the next
- Keep vocabulary appropriate for young children
- Include emotional moments that children can relate to

Please ensure the story is engaging, educational, and celebrates the unique qualities of ${childProfiles.map(p => p.name).join(' and ')}.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative children's book author who specializes in educational and magical stories for young children. You create engaging, age-appropriate content that teaches valuable life lessons while entertaining children."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8, // Creative but controlled
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    try {
      const storyData = JSON.parse(response) as GeneratedStory
      
      // Validate the response structure
      if (!storyData.title || !storyData.pages || !Array.isArray(storyData.pages)) {
        throw new Error('Invalid story structure received from OpenAI')
      }

      // Ensure page numbers are sequential
      storyData.pages.forEach((page, index) => {
        page.pageNumber = index + 1
      })

      storyData.totalPages = storyData.pages.length

      return storyData
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response)
      throw new Error('Failed to parse story response from OpenAI')
    }

  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error('Failed to generate story with OpenAI')
  }
} 