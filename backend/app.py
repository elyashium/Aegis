from flask import Flask, request, jsonify
from pyngrok import ngrok, conf
import json
import os

# --- Configuration ---
PORT = 5001

# --- RAG Logic for Follow-up ---

def generate_llm_prompt_for_follow_up(
    initial_user_query: str,
    dashboard_state_dict: dict, # This will be the content of "current_dashboard_data"
    user_follow_up_query: str  # This will be the "update_prompt"
) -> str:
    """
    Constructs the detailed prompt for the LLM based on the new input schema.
    """
    dashboard_state_json_str = json.dumps(dashboard_state_dict, indent=2)

    prompt = f"""
*Role:* You are Aegis, an AI legal assistant. You are providing follow-up guidance to a user who has already received initial advice from you and has made some progress on their legal tasks, tracked on their interactive dashboard.

*Context Provided to You:*

1.  *User's Original Overarching Goal/Query:*
    *   {initial_user_query}

2.  *User's Current Follow-up Question/Request:*
    *   {user_follow_up_query}

3.  *Current Dashboard State Snapshot:*
    ```json
    {dashboard_state_json_str}
    ```
    *Key elements in the dashboard state to pay attention to:*
    *   `checklists`: Shows existing task lists, their items, and completion status.
    *   `documents`: Shows documents, their types, and upload status.
    *   `compliance_alerts`: Shows any pending alerts or deadlines.

*Your Task:*

Based on the user's original goal, their current dashboard progress, AND their specific follow-up question, provide *focused, follow-up advice and next steps.*

*Output Structure Requirements for Follow-up:*

Your response MUST be in Markdown. It should be more concise than the initial guidance.

1.  *Acknowledge Progress (Optional but Recommended):*
    *   Briefly acknowledge the user's progress if appropriate, especially in relation to their follow-up question.

2.  *Identify Key Next Steps / New Considerations:*
    *   Directly address the user's `Current Follow-up Question/Request`.
    *   Based on completed items, uploaded documents, and the original goal, what should the user focus on next?
    *   Are there new tasks or considerations that arise from their progress or specific request?
    *   Use #### H4 Titles for these focused areas if you need to introduce new small sections or new checklist categories (e.g., if the user asks to create a new checklist).
    *   List new actionable items as a Markdown bulleted list.
    *   If these new items are documents, use the **Document Name (document)** format.

3.  *Format for Incremental Updates:*
    *   *Crucially, your response should NOT try to regenerate the entire dashboard structure.*
    *   Focus on providing new checklist items or updates/clarifications to existing areas.
    *   If you are suggesting additions to an existing dashboard checklist (identified by its `name` in the context), you can indicate this.
        *   Example: For your "Business Registration" checklist, consider adding these:
          - Task X
          - Task Y
    *   If you're proposing a new small set of checklist items that don't fit neatly into existing checklists (or if the user explicitly asks for a new checklist), use an H4 heading for them.
        *   Example:
            ```markdown
            #### Next Steps in IP Protection
            - Conduct a detailed patent search.
            - Draft provisional **Patent Application (document)**.
            ```

4.  *No Full Re-Structure:* Do NOT use H3 titles in this follow-up response unless it's for a very significant, new phase that warrants a new major tab/section (this should be rare for follow-ups). The primary goal is incremental additions/guidance.

5.  *Disclaimer:*
    *   Conclude with your standard disclaimer.
"""
    return prompt

def get_follow_up_advice_from_rag(
    initial_user_query: str,
    dashboard_state: dict, # This is current_dashboard_data
    user_follow_up_query: str
) -> str:
    """
    Simulates the RAG system processing the context and generating follow-up advice.
    """
    llm_prompt = generate_llm_prompt_for_follow_up(initial_user_query, dashboard_state, user_follow_up_query)

    print("\n--- Generated LLM Prompt for Follow-up (v2) ---")
    print(llm_prompt)
    print("--- End of LLM Prompt (v2) ---\n")

    # --- THIS IS WHERE YOU WOULD CALL YOUR ACTUAL LLM ---
    # For now, we'll use a MOCK response based on the new input.

    mock_markdown_response = ""

    # Acknowledge progress based on user's prompt
    if "uploaded the draft MOA" in user_follow_up_query.lower() or \
       "completed the DIN application" in user_follow_up_query.lower():
        mock_markdown_response += "Great job on preparing the DIN application and drafting the MOA! Let's look at the next steps.\n\n"
    else:
        mock_markdown_response += "Thanks for the update. Here's some guidance based on your request and current progress:\n\n"

    # Specific logic for business registration next steps
    # Check if "Prepare Director Identification Number (DIN) application" is completed
    din_completed = False
    moa_drafted_or_uploaded = False

    for cl in dashboard_state.get("checklists", []):
        if cl.get("name") == "Business Registration":
            for item in cl.get("items", []):
                if item.get("text") == "Prepare Director Identification Number (DIN) application" and item.get("completed"):
                    din_completed = True
                if item.get("text") == "Draft Memorandum of Association (MOA)" and item.get("completed"): # Assuming drafting means it's ready
                    moa_drafted_or_uploaded = True

    # Check documents for MOA
    for doc in dashboard_state.get("documents", []):
        if "moa" in doc.get("name", "").lower() and doc.get("status", "").lower() in ["uploaded", "pending review"]:
            moa_drafted_or_uploaded = True
            break

    if "business registration" in user_follow_up_query.lower():
        mock_markdown_response += "For your \"Business Registration\" checklist:\n"
        if din_completed and moa_drafted_or_uploaded:
            mock_markdown_response += "- Now that the DIN and MOA are ready, the next critical step is to **File for company incorporation (SPICe+ form) (document)** with the MCA.\n"
            mock_markdown_response += "- Ensure your **Articles of Association (AoA) (document)** are also finalized alongside the MOA.\n"
        elif din_completed:
            mock_markdown_response += "- Since the DIN is ready, focus on finalizing and uploading your **Draft Memorandum of Association (MOA) (document)**.\n"
        else:
            mock_markdown_response += "- Please ensure the Director Identification Number (DIN) applications are completed first.\n"
        mock_markdown_response += "\n"


    # Specific logic for tax registrations if requested
    if "tax registrations" in user_follow_up_query.lower():
        mock_markdown_response += "#### Basic Tax Registrations Checklist\n"
        mock_markdown_response += "- Obtain **Permanent Account Number (PAN) (document)** for the company.\n"
        mock_markdown_response += "- Obtain **Tax Deduction and Collection Account Number (TAN) (document)** for the company.\n"
        mock_markdown_response += "- Evaluate and proceed with **Goods and Services Tax (GST) Registration (document)** if applicable to your business turnover and services.\n"
        mock_markdown_response += "- Register for **Professional Tax (PT) (document)** if applicable in your state and for your employees.\n\n"

    # Add some generic advice if no specific requests were matched strongly
    if "For your \"Business Registration\" checklist:" not in mock_markdown_response and \
       "#### Basic Tax Registrations Checklist" not in mock_markdown_response:
        mock_markdown_response += "Based on your current progress, ensure all items in the 'Business Registration' checklist are addressed. If you have specific questions about other areas like 'Initial IP Protection' or 'Website Legal Pages', let me know!\n\n"


    mock_markdown_response += "---\n"
    mock_markdown_response += "### Disclaimer\n"
    mock_markdown_response += "Aegis is an AI Legal Assistant. The information provided is for guidance and informational purposes only. It does not constitute legal advice. Consult with a qualified legal professional for advice tailored to your specific situation. We are not liable for any actions taken based on this information."

    return mock_markdown_response


# --- Flask App ---
app = Flask(__name__)

@app.route('/status', methods=['GET'])
def status():
    return jsonify({"status": "Follow-up RAG service (v2) is running"}), 200

@app.route('/follow-up-rag', methods=['POST'])
def handle_follow_up_rag():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    current_dashboard_data = data.get('current_dashboard_data')
    update_prompt_from_user = data.get('update_prompt') # Renamed for clarity

    if not current_dashboard_data or not update_prompt_from_user:
        missing_fields = []
        if not current_dashboard_data: missing_fields.append("'current_dashboard_data'")
        if not update_prompt_from_user: missing_fields.append("'update_prompt'")
        return jsonify({"error": f"Missing required top-level fields: {', '.join(missing_fields)}"}), 400

    initial_user_query = current_dashboard_data.get('initial_user_query')
    if not initial_user_query:
        return jsonify({"error": "Missing 'initial_user_query' within 'current_dashboard_data'"}), 400

    try:
        # Get advice from our RAG
        advice_markdown = get_follow_up_advice_from_rag(
            initial_user_query,
            current_dashboard_data, # Pass the whole dashboard data object
            update_prompt_from_user
        )
        return jsonify({"follow_up_markdown": advice_markdown}), 200
    except Exception as e:
        app.logger.error(f"Error processing RAG request: {e}", exc_info=True)
        return jsonify({"error": "An internal error occurred processing your request."}), 500


if __name__ == "__main__":
    public_url = None # Define to ensure it's in scope for finally
    try:
        # conf.get_default().region = "in"
        public_url = ngrok.connect(PORT)
        print(f" * Flask App is running on http://127.0.0.1:{PORT}")
        print(f" * ngrok tunnel \"{public_url}\" -> \"http://127.0.0.1:{PORT}\"")
        print(f" * Access your follow-up RAG at: {public_url}/follow-up-rag (POST)")
        print(f" * Status endpoint: {public_url}/status (GET)")

        app.run(port=PORT, debug=False)

    except Exception as e:
        print(f"Failed to start ngrok or Flask app: {e}")
    finally:
        if public_url:
            print("Shutting down ngrok tunnel...")
            ngrok.disconnect(public_url) # Use the stored public_url string
        else: # If ngrok never started, public_url might be the Tunnel object if connect succeeded but run failed
            active_tunnels = ngrok.get_tunnels()
            for tunnel in active_tunnels:
                if tunnel.config['addr'] == f'http://localhost:{PORT}': # or check specific url
                    ngrok.disconnect(tunnel.public_url)
                    print(f"Disconnected tunnel: {tunnel.public_url}")
                    break
        print("Exiting.")