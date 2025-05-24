import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import * as marked from 'marked';

// Types based on Supabase schema
export interface Checklist {
  id: string;
  user_id: string;
  name: string;
  progress: number;
  created_at: Date;
  updated_at: Date;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  completed: boolean;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface Document {
  id: string;
  user_id: string;
  name: string;
  document_type: string;
  upload_date: Date;
  file_path: string | null;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface RecentActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  reference_id: string | null;
  timestamp: Date;
  created_at: Date;
}

export interface ComplianceAlert {
  id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: Date | null;
  status: 'pending' | 'acknowledged' | 'resolved';
  severity: 'low' | 'medium' | 'high';
  link_to_action: string | null;
  created_at: Date;
  updated_at: Date;
}

// Helper function to format dates for Supabase
const formatDateForSupabase = (date: Date): string => {
  return date.toISOString();
};

// Helper function to determine if a heading is compliance-related
const isComplianceRelated = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return (
    lowerText.includes('compliance') ||
    lowerText.includes('legal requirement') ||
    lowerText.includes('regulatory') ||
    lowerText.includes('regulation') ||
    lowerText.includes('law') ||
    lowerText.includes('legal') ||
    lowerText.includes('requirement')
  );
};

// Parse RAG output to extract sections, checklists, and documents
interface ParsedRagSection {
  title: string;
  content: string;
  checklistItems: string[];
}

interface ParsedRagOutput {
  sections: ParsedRagSection[];
  complianceChecklist: string[];
  documentRequirements: string[];
}

// Function to parse RAG output in markdown format
export const parseRagOutput = (ragMarkdown: string): ParsedRagOutput => {
  console.log('Parsing RAG markdown output');
  let processedMarkdown = ragMarkdown;

  // Check for and remove markdown code block fences
  const codeBlockRegex = /^```markdown\n([\s\S]*?)\n```$/;
  const match = processedMarkdown.match(codeBlockRegex);
  if (match && match[1]) {
    console.log('Markdown code block fence detected. Extracting content.');
    processedMarkdown = match[1];
  } else {
    // Fallback for cases where it might just be ``` at start/end without 'markdown' specifier or different newlines
    const genericCodeBlockRegex = /^```(?:\w*\n)?([\s\S]*?)\n?```$/;
    const genericMatch = processedMarkdown.match(genericCodeBlockRegex);
    if (genericMatch && genericMatch[1]) {
        console.log('Generic code block fence detected. Extracting content.');
        processedMarkdown = genericMatch[1];
    }
  }
  
  const result: ParsedRagOutput = {
    sections: [],
    complianceChecklist: [],
    documentRequirements: []
  };
  
  try {
    // Parse Markdown to tokens using marked
    const tokens = marked.lexer(processedMarkdown);
    console.log(`Markdown parsed into ${tokens.length} tokens`);

    if (tokens.length < 5 && tokens.length > 0) { // If very few tokens, log the first one for inspection
      console.log('First token details (if parsing seems incorrect, check the raw content):', {
        type: tokens[0].type,
        raw: tokens[0].raw?.substring(0, 500) + (tokens[0].raw?.length > 500 ? '... [TRUNCATED]' : ''),
        text: tokens[0].text?.substring(0, 500) + (tokens[0].text?.length > 500 ? '... [TRUNCATED]' : ''),
      });
      if (tokens[0].tokens && Array.isArray(tokens[0].tokens)) { // If it's a paragraph with sub-tokens (like inline elements)
          console.log('Sub-tokens of the first token (first 5):', tokens[0].tokens.slice(0,5).map(t => ({type: t.type, text: t.text?.substring(0,100)})));
      } else if (tokens.length === 1 && tokens[0].type !== 'space') {
        console.warn('The entire RAG output was parsed as a single token. This usually means the input markdown is not structured with multiple elements (headings, lists, paragraphs) or there are issues with newline characters.');
      }
    }
    
    let currentSection: ParsedRagSection | null = null;
    let inComplianceSection = false;
    let collectingActionableSteps = false;
    
    // First pass - identify all headers to debug
    console.log('Headers found in RAG output:');
    tokens.forEach((token, index) => {
      if (token.type === 'heading') {
        console.log(`  [${index}] H${token.depth}: "${token.text}"`);
      }
    });
    
    // Look for patterns in the markdown structure
    const hasStepHeadings = tokens.some(token => 
      token.type === 'heading' && token.text.startsWith('Step ')
    );
    
    const hasActionableSteps = tokens.some(token => 
      token.type === 'heading' && token.text.includes('Actionable Steps')
    );

    // Identify if we have a specific "Compliance Dashboard" section
    const hasComplianceSection = tokens.some(token =>
      token.type === 'heading' && isComplianceRelated(token.text)
    );
    
    console.log(`RAG structure analysis: hasStepHeadings=${hasStepHeadings}, hasActionableSteps=${hasActionableSteps}, hasComplianceSection=${hasComplianceSection}`);
    
    // If we don't have the expected structure, try to adapt
    if (!hasStepHeadings) {
      console.log('No Step headings found, attempting adaptive parsing strategy...');
      // Look for any H2 or H3 headings as potential sections, excluding compliance-related ones
      let potentialSectionTokens = tokens.filter(token => 
        token.type === 'heading' && (token.depth === 2 || token.depth === 3) && 
        !token.text.toLowerCase().includes('actionable steps') &&
        !token.text.toLowerCase().includes('compliance dashboard') &&
        !token.text.toLowerCase().includes('compliance checklist')
      );
      
      console.log(`Found ${potentialSectionTokens.length} potential section heading tokens for adaptive strategy.`);

      if (potentialSectionTokens.length > 0) {
        let sectionStartIndex = -1;

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];

          // Check if this is a compliance-related section
          if (token.type === 'heading' && isComplianceRelated(token.text)) {
            inComplianceSection = true;
            // Don't create a section for this, instead collect items for compliance checklist
            continue;
          }

          if (token.type === 'heading' && (token.depth === 2 || token.depth === 3) && 
              !token.text.toLowerCase().includes('actionable steps') &&
              !isComplianceRelated(token.text)) {
            if (currentSection) {
              result.sections.push(currentSection);
            }
            currentSection = {
              title: token.text,
              content: token.text,
              checklistItems: []
            };
            sectionStartIndex = i;
            inComplianceSection = false; // Reset compliance flag when starting a new section
            console.log(`Adaptive: Started section "${currentSection.title}"`);
          }
          // If we are in a section, collect lists
          else if (token.type === 'list') {
            // If we're in compliance section, add to compliance checklist
            if (inComplianceSection) {
              const listItems = (token.items || []).map((item: any) => 
                item.text.replace(/^[0-9]+\.\s*/, '').trim()
              );
              result.complianceChecklist.push(...listItems);
              console.log(`Adaptive: Added ${listItems.length} items to compliance checklist`);
              continue;
            }
            
            // Otherwise, if we are in a section, add to that section's checklist
            if (currentSection) {
              // Check if this list token is part of the current section before the next heading
              let isListForCurrentSection = true;
              if (sectionStartIndex !== -1) {
                  for (let k = sectionStartIndex + 1; k < i; k++) {
                      if (tokens[k].type === 'heading' && (tokens[k].depth === 2 || tokens[k].depth === 3)) {
                          isListForCurrentSection = false;
                          break;
                      }
                  }
              }

              if(isListForCurrentSection){
                  const listItems = (token.items || []).map((item: any) => 
                  item.text.replace(/^[0-9]+\.\s*/, '').trim()
                  );
                  currentSection.checklistItems.push(...listItems);
                  console.log(`Adaptive: Added ${listItems.length} items to section "${currentSection.title}"`);
                  
                  // Extract potential document requirements
                  const docItems = listItems.filter(item => 
                  item.toLowerCase().includes('document') || 
                  item.toLowerCase().includes('certificate') ||
                  item.toLowerCase().includes('license') ||
                  item.toLowerCase().includes('form')
                  );
                  if(docItems.length > 0) {
                      result.documentRequirements.push(...docItems);
                      console.log(`Adaptive: Added ${docItems.length} document requirements from section "${currentSection.title}"`);
                  }
              }
            }
          }
        }
        
        // Add the last section
        if (currentSection) {
          result.sections.push(currentSection);
        }
        
        // If we found sections but no compliance checklist, create one from all checklist items
        if (result.sections.length > 0 && result.complianceChecklist.length === 0) {
          console.log('Adaptive: Creating compliance checklist from all section checklist items (first 2 from each)');
          result.sections.forEach(section => {
            const itemsForCompliance = section.checklistItems.slice(0, 2);
            if (itemsForCompliance.length > 0) {
              result.complianceChecklist.push(
                ...itemsForCompliance.map(item => `${section.title}: ${item}`)
              );
            }
          });
        }
        console.log('Adaptive parsing strategy complete.');
      } else {
        console.log('Adaptive parsing strategy: No suitable section headings found. Cannot extract structured data.');
      }
    }
    // Standard parsing logic for Step-based structure (if adaptive didn't run or found nothing)
    else if (hasStepHeadings) {
      console.log('Using standard Step-based parsing strategy.');
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        // Check if this is a compliance-related section
        if (token.type === 'heading' && isComplianceRelated(token.text)) {
          // If we were in a section, add it to the result
          if (currentSection) {
            result.sections.push(currentSection);
            currentSection = null;
          }
          inComplianceSection = true;
          collectingActionableSteps = false;
          console.log(`Standard: Found compliance section "${token.text}"`);
          continue;
        }
        
        // Detect main sections (H3 headings starting with "Step")
        if (token.type === 'heading' && token.depth === 3 && token.text.startsWith('Step') &&
            !isComplianceRelated(token.text)) {
          if (currentSection) {
            result.sections.push(currentSection);
          }
          
          currentSection = {
            title: token.text,
            content: token.text,
            checklistItems: []
          };
          console.log(`Standard: Started section "${currentSection.title}"`);
          collectingActionableSteps = false;
          inComplianceSection = false;
        }
        // Detect "Actionable Steps" sections
        else if (token.type === 'heading' && token.depth === 4 && token.text.includes('Actionable Steps')) {
          collectingActionableSteps = true;
          console.log(`Standard: Collecting actionable steps for "${inComplianceSection ? 'Compliance Dashboard' : currentSection?.title || 'unknown'}""`);
        }
        // Collect list items under actionable steps
        else if (token.type === 'list') {
          const listItems = (token.items || []).map((item: any) => item.text.replace(/^[0-9]+\.\s*/, '').trim());

          // If we're in compliance section, add to compliance checklist
          if (inComplianceSection) {
            result.complianceChecklist.push(...listItems);
            console.log(`Standard: Added ${listItems.length} items to compliance checklist`);
          }
          // Otherwise, if collecting actionable steps and in a section, add to that section's checklist
          else if (collectingActionableSteps && currentSection) {
            currentSection.checklistItems.push(...listItems);
            console.log(`Standard: Added ${listItems.length} items to section "${currentSection.title}"`);
          }
          
          // Extract document requirements regardless of which section we're in
          const docItems = listItems.filter(item => 
            item.toLowerCase().includes('pan card') || 
            item.toLowerCase().includes('moa') || 
            item.toLowerCase().includes('aoa') ||
            item.toLowerCase().includes('document') ||
            item.toLowerCase().includes('certificate') ||
            item.toLowerCase().includes('license') ||
            item.toLowerCase().includes('form')
          );
          if(docItems.length > 0) {
            result.documentRequirements.push(...docItems);
            console.log(`Standard: Added ${docItems.length} document requirements`);
          }
        }
      }
      
      // Add the last section
      if (currentSection) {
        result.sections.push(currentSection);
      }
    } else {
        console.log('No suitable parsing strategy found based on RAG structure analysis.');
    }
    
    // If we have no compliance checklist but have sections, create one (applies to both strategies if compliance not found)
    if (result.complianceChecklist.length === 0 && result.sections.length > 0) {
      console.log('Final check: No specific compliance checklist found, creating one from section items (first 2 from each)');
      result.sections.forEach(section => {
        const itemsForCompliance = section.checklistItems.slice(0, 2);
        if (itemsForCompliance.length > 0) {
          result.complianceChecklist.push(
            ...itemsForCompliance.map(item => `${section.title}: ${item}`)
          );
        }
      });
    }
    
    // Log the parsing results
    console.log(`Parsing complete: ${result.sections.length} sections, ${result.complianceChecklist.length} compliance items, ${result.documentRequirements.length} document requirements`);
    
    return result;
  } catch (err) {
    console.error('Error parsing RAG output:', err);
    return result; // Return empty result on error
  }
};

// Create a new checklist
export const createChecklist = async (
  userId: string,
  name: string
): Promise<Checklist | null> => {
  try {
    console.log(`Creating checklist "${name}" for user ${userId}`);
    const now = new Date();
    
    const newChecklist = {
      id: uuidv4(),
      user_id: userId,
      name,
      progress: 0,
      created_at: formatDateForSupabase(now),
      updated_at: formatDateForSupabase(now)
    };
    
    console.log(`Inserting checklist into database:`, newChecklist);
    
    const { data, error } = await supabase
      .from('checklists')
      .insert(newChecklist)
      .select();
    
    if (error) {
      console.error('Error creating checklist:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned after creating checklist');
      return null;
    }
    
    console.log(`Successfully created checklist with ID: ${data[0].id}`);
    
    return {
      ...data[0],
      created_at: new Date(data[0].created_at),
      updated_at: new Date(data[0].updated_at)
    };
  } catch (err) {
    console.error('Exception in createChecklist:', err);
    return null;
  }
};

// Add items to a checklist
export const addChecklistItems = async (
  checklistId: string,
  items: string[]
): Promise<ChecklistItem[] | null> => {
  try {
    console.log(`Adding ${items.length} items to checklist ${checklistId}`);
    
    if (items.length === 0) {
      console.log('No items to add, returning empty array');
      return [];
    }
    
    const now = new Date();
    
    const checklistItems = items.map((text, index) => ({
      id: uuidv4(),
      checklist_id: checklistId,
      text,
      completed: false,
      order_index: index,
      created_at: formatDateForSupabase(now),
      updated_at: formatDateForSupabase(now)
    }));
    
    console.log(`Inserting ${checklistItems.length} checklist items into database`);
    
    const { data, error } = await supabase
      .from('checklist_items')
      .insert(checklistItems)
      .select();
    
    if (error) {
      console.error('Error adding checklist items:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned after adding checklist items');
      return [];
    }
    
    console.log(`Successfully added ${data.length} checklist items`);
    
    return data.map(item => ({
      ...item,
      created_at: new Date(item.created_at),
      updated_at: new Date(item.updated_at)
    }));
  } catch (err) {
    console.error('Exception in addChecklistItems:', err);
    return null;
  }
};

// Create document entries for required documents
export const createDocumentEntries = async (
  userId: string,
  documentNames: string[]
): Promise<Document[] | null> => {
  const now = new Date();
  
  const documents = documentNames.map(name => ({
    id: uuidv4(),
    user_id: userId,
    name,
    document_type: 'Required Document',
    upload_date: formatDateForSupabase(now),
    file_path: null,
    metadata: { status: 'Required', description: `Required document from compliance guidance` },
    created_at: formatDateForSupabase(now),
    updated_at: formatDateForSupabase(now)
  }));
  
  const { data, error } = await supabase
    .from('documents')
    .insert(documents)
    .select();
  
  if (error) {
    console.error('Error creating document entries:', error);
    return null;
  }
  
  return data.map(doc => ({
    ...doc,
    upload_date: new Date(doc.upload_date),
    created_at: new Date(doc.created_at),
    updated_at: new Date(doc.updated_at)
  }));
};

// Log recent activity
export const logActivity = async (
  userId: string,
  activityType: string,
  description: string,
  referenceId?: string
): Promise<RecentActivity | null> => {
  const now = new Date();
  
  const activity = {
    id: uuidv4(),
    user_id: userId,
    activity_type: activityType,
    description,
    reference_id: referenceId || null,
    timestamp: formatDateForSupabase(now),
    created_at: formatDateForSupabase(now)
  };
  
  const { data, error } = await supabase
    .from('recent_activity')
    .insert(activity)
    .select()
    .single();
  
  if (error) {
    console.error('Error logging activity:', error);
    return null;
  }
  
  return {
    ...data,
    timestamp: new Date(data.timestamp),
    created_at: new Date(data.created_at)
  };
};

// Update checklist progress
export const updateChecklistProgress = async (
  checklistId: string,
  progress: number
): Promise<boolean> => {
  const now = new Date();
  
  const { error } = await supabase
    .from('checklists')
    .update({
      progress,
      updated_at: formatDateForSupabase(now)
    })
    .eq('id', checklistId);
  
  if (error) {
    console.error('Error updating checklist progress:', error);
    return false;
  }
  
  return true;
};

// Main function to process RAG output and update dashboard
export const absorbRagGuidance = async (
  userId: string,
  ragMarkdown: string
): Promise<{ success: boolean; createdItems: Record<string, any>; alreadyExisted: boolean }> => {
  try {
    console.log(`Starting to absorb RAG guidance for user ${userId}`);
    console.log(`RAG markdown length: ${ragMarkdown.length} characters`);
    
    const parsedOutput = parseRagOutput(ragMarkdown);
    console.log(`Parsed output:`, {
      sectionsCount: parsedOutput.sections.length,
      complianceItemsCount: parsedOutput.complianceChecklist.length,
      documentRequirementsCount: parsedOutput.documentRequirements.length
    });
    
    const createdItems: Record<string, any> = {
      checklists: [],
      complianceChecklist: null,
      documents: []
    };

    // Check if any of these checklists already exist by name
    let alreadyExisted = false;
    const existingChecklistNames = new Set();
    
    // Check for existing compliance checklist
    const existingComplianceChecklist = await fetchChecklistByName(userId, "Compliance Dashboard");
    if (existingComplianceChecklist) {
      alreadyExisted = true;
      existingChecklistNames.add("Compliance Dashboard");
    }

    // Check for existing section checklists
    for (const section of parsedOutput.sections) {
      const existingChecklist = await fetchChecklistByName(userId, section.title);
      if (existingChecklist) {
        alreadyExisted = true;
        existingChecklistNames.add(section.title);
      }
    }
    
    // If any checklists already exist, return early with alreadyExisted flag
    if (alreadyExisted) {
      console.log(`Some or all checklists already exist: ${Array.from(existingChecklistNames).join(', ')}`);
      return { success: true, createdItems, alreadyExisted: true };
    }
    
    // Process main sections as tabs with checklists
    console.log(`Processing ${parsedOutput.sections.length} sections as checklists`);
    for (const section of parsedOutput.sections) {
      console.log(`Creating checklist for section: "${section.title}" with ${section.checklistItems.length} items`);
      
      // Create a checklist for each section
      const checklist = await createChecklist(userId, section.title);
      if (checklist) {
        console.log(`Successfully created checklist: ${checklist.id} - ${checklist.name}`);
        
        if (section.checklistItems.length > 0) {
          console.log(`Adding ${section.checklistItems.length} items to checklist ${checklist.id}`);
          const items = await addChecklistItems(checklist.id, section.checklistItems);
          if (items) {
            console.log(`Successfully added ${items.length} items to checklist ${checklist.id}`);
            createdItems.checklists.push({
              checklist,
              items
            });
          } else {
            console.error(`Failed to add items to checklist ${checklist.id}`);
          }
        } else {
          console.log(`No items to add to checklist ${checklist.id}`);
        }
      } else {
        console.error(`Failed to create checklist for section: "${section.title}"`);
      }
    }
    
    // Process compliance checklist
    if (parsedOutput.complianceChecklist.length > 0) {
      console.log(`Creating compliance checklist with ${parsedOutput.complianceChecklist.length} items`);
      const complianceChecklist = await createChecklist(userId, "Compliance Dashboard");
      if (complianceChecklist) {
        console.log(`Successfully created compliance checklist: ${complianceChecklist.id}`);
        const items = await addChecklistItems(complianceChecklist.id, parsedOutput.complianceChecklist);
        if (items) {
          console.log(`Successfully added ${items.length} items to compliance checklist`);
          createdItems.complianceChecklist = {
            checklist: complianceChecklist,
            items
          };
        } else {
          console.error(`Failed to add items to compliance checklist`);
        }
      } else {
        console.error(`Failed to create compliance checklist`);
      }
    } else {
      console.log(`No compliance checklist items found in the RAG output`);
    }
    
    // Process document requirements
    if (parsedOutput.documentRequirements.length > 0) {
      console.log(`Processing ${parsedOutput.documentRequirements.length} document requirements`);
      const uniqueDocuments = Array.from(new Set(parsedOutput.documentRequirements));
      console.log(`Found ${uniqueDocuments.length} unique document requirements`);
      const documents = await createDocumentEntries(userId, uniqueDocuments);
      if (documents) {
        console.log(`Successfully created ${documents.length} document entries`);
        createdItems.documents = documents;
      } else {
        console.error(`Failed to create document entries`);
      }
    } else {
      console.log(`No document requirements found in the RAG output`);
    }
    
    // Log the activity
    await logActivity(
      userId,
      'guidance_absorbed',
      'Absorbed RAG guidance into dashboard',
      null
    );
    
    console.log(`Successfully absorbed RAG guidance for user ${userId}`);
    console.log(`Created items summary:`, {
      checklistsCount: createdItems.checklists.length,
      hasComplianceChecklist: !!createdItems.complianceChecklist,
      documentsCount: createdItems.documents.length
    });
    
    return { success: true, createdItems, alreadyExisted: false };
  } catch (error) {
    console.error('Error absorbing RAG guidance:', error);
    return { success: false, createdItems: {}, alreadyExisted: false };
  }
};

// Fetch a specific checklist by name for a user
export const fetchChecklistByName = async (
  userId: string,
  checklistName: string
): Promise<Checklist | null> => {
  try {
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', userId)
      .eq('name', checklistName);

    if (error) {
      console.error('Error fetching checklist by name:', error);
      return null;
    }
    
    // Check if we have any results
    if (!data || data.length === 0) {
      console.log(`No checklist found with name "${checklistName}" for user ${userId}`);
      return null;
    }
    
    // Return the first matching checklist
    return { 
      ...data[0], 
      created_at: new Date(data[0].created_at), 
      updated_at: new Date(data[0].updated_at) 
    };
  } catch (err) {
    console.error('Exception in fetchChecklistByName:', err);
    return null;
  }
};

// Fetch all items for a specific checklist
export const fetchChecklistItemsForChecklist = async (
  checklistId: string
): Promise<ChecklistItem[] | null> => {
  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('checklist_id', checklistId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching checklist items:', error);
    return [];
  }
  return data ? data.map(item => ({ ...item, created_at: new Date(item.created_at), updated_at: new Date(item.updated_at) })) : [];
};

// Fetch all checklists for a user (will be used for dynamic tabs later)
export const fetchChecklistsForUser = async (
  userId: string
): Promise<Checklist[]> => {
  const { data, error } = await supabase
    .from('checklists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching checklists for user:', error);
    return [];
  }
  return data ? data.map(checklist => ({ ...checklist, created_at: new Date(checklist.created_at), updated_at: new Date(checklist.updated_at) })) : [];
};

// Fetch all documents for a user
export const fetchDocumentsForUser = async (
  userId: string
): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('upload_date', { ascending: false });

  if (error) {
    console.error('Error fetching documents for user:', error);
    return [];
  }
  return data ? data.map(doc => ({ ...doc, upload_date: new Date(doc.upload_date), created_at: new Date(doc.created_at), updated_at: new Date(doc.updated_at) })) : [];
};

// Update a checklist item's completion status
export const updateChecklistItemCompletion = async (
  itemId: string,
  completed: boolean
): Promise<boolean> => {
  const now = new Date();
  const { error } = await supabase
    .from('checklist_items')
    .update({ completed, updated_at: formatDateForSupabase(now) })
    .eq('id', itemId);

  if (error) {
    console.error('Error updating checklist item:', error);
    return false;
  }
  return true;
}; 