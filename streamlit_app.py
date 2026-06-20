"""Optional Streamlit UI for CogniFlow Pro.

Run only if Streamlit is installed:
    streamlit run streamlit_app.py
"""

from __future__ import annotations

try:
    import streamlit as st
except ImportError as exc:  # pragma: no cover
    raise SystemExit("Streamlit is not installed. Install it with: pip install streamlit") from exc

from cogniflow_pro.pipeline import CogniFlowProPipeline
from cogniflow_pro.sample_data import sample_case


st.set_page_config(page_title="CogniFlow Pro", layout="wide")
st.title("CogniFlow Pro")
st.caption("Python AI demo: NLP, ML classification, memory retrieval, study history, and adaptive planning.")

case = sample_case()
check_in = st.text_area("Student check-in", value=case.check_in, height=130)
history_question = st.text_input("History question", value="What did I study yesterday?")
mode = st.selectbox("Retrieval mode", ["tfidf", "hashing"])

if st.button("Analyze"):
    case = type(case)(check_in, case.tasks, case.notes, case.study_logs, case.label)
    result = CogniFlowProPipeline(retrieval_mode=mode).run(case, history_question)

    left, right = st.columns(2)
    with left:
        st.subheader("Cognitive State")
        st.metric(result.prediction.label.title(), f"{result.prediction.confidence:.2f} confidence")
        st.write(result.prediction.reasons)
        st.subheader("Retrieved Notes")
        for item in result.retrieved_notes:
            st.write(f"**{item.note.title}** ({item.method}, score={item.score:.2f})")
            st.write(item.note.body)

    with right:
        st.subheader("Study History")
        if result.history_answer:
            st.write(result.history_answer.answer)
        st.subheader("Adaptive Plan")
        for step in result.plan.steps:
            st.write(f"- **{step.action}**")
            st.caption(step.reason)
        st.warning(result.plan.human_control)
        st.info(result.plan.disclaimer)

