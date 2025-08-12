import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LectureOutputPanel from './LectureOutputPanel';
import QuizSelector from './QuizSelector';
import SimulationSelector from './SimulationSelector';
import BrowseSavedItems from "./BrowseSavedItems"; // PATCH: Unified browser for all types
import { Card, CardContent } from "./ui/Card"; // <- Make sure this path is correct

function TeachingPanel() {
  const [inputTopic, setInputTopic] = useState('');
  const [lectureText, setLectureText] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [mode, setMode] = useState('lecture');
  const [xpData, setXpData] = useState({ xp: 0, level: 1 });
  const [difficulty, setDifficulty] = useState('Moderate');

  useEffect(() => {
    const fetchXp = async () => {
      try {
        const res = await axios.get('/memory/xp_tracker.json');
        setXpData(res.data);
      } catch {
        console.error('Could not load XP data.');
      }
    };
    fetchXp();
  }, []);

  const cleanJsonString = (text) => {
    if (!text) return '';
    return text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/, '')
      .replace(/\n```$/, '')
      .replace(/[\r\n]+$/, '')
      .replace(/^\uFEFF/, '')
      .trim();
  };

  const tryParseJson = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      try {
        const fixed = text.trim();
        const lastBrace = fixed.lastIndexOf('}');
        if (lastBrace !== -1) {
          return JSON.parse(fixed.substring(0, lastBrace + 1));
        }
      } catch {}
    }
    return null;
  };

  // === PATCHED ENDPOINTS BELOW ===

  const fetchLecture = async () => {
    if (!inputTopic.trim()) return;
    try {
      const res = await axios.post('http://localhost:5002/api/lecture', {
        topic: inputTopic,
        difficulty
      });
      const raw = res.data.lecture || res.data;
      const clean = cleanJsonString(typeof raw === 'string' ? raw : JSON.stringify(raw));
      const parsed = tryParseJson(clean);
      if (parsed) {
        setLectureText(parsed);
        setMode('lecture');
      } else {
        console.error('Failed to parse lecture JSON.');
        setLectureText({ error: "Failed to parse JSON from server." });
      }
    } catch (error) {
      console.error('Error fetching lecture:', error);
      setLectureText({ error: "Network or server error." });
    }
  };

  const fetchQuiz = async () => {
    if (!inputTopic.trim()) return;
    try {
      const res = await axios.post('http://localhost:5002/api/quiz', {
        topic: inputTopic,
        difficulty
      });
      setQuizData(res.data.questions ? res.data : { questions: [] });
      setMode('quiz');
    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  const fetchSimulation = async () => {
    if (!inputTopic.trim()) return;
    try {
      const res = await axios.post('http://localhost:5002/api/simulate', {
        topic: inputTopic,
        difficulty
      });
      let data = res.data;
      if (!data.case && data.hpi) {
        data = {
          case: {
            hpi: data.hpi,
            vitals: data.vitals,
            exam: data.exam,
            labs: data.labs,
            imaging: data.imaging,
            summary: data.summary || '',
          },
          decisions: data.decisions || []
        };
      }
      setSimulationData(data.case ? data : null);
      setMode('simulate');
    } catch (error) {
      console.error('Error fetching simulation:', error);
    }
  };

  // PATCH: Handler for loading saved lecture, quiz, or simulation
  const handleLoadSavedLecture = (lecture, topic) => {
    setLectureText(lecture);
    setMode('lecture');
    setInputTopic(topic || "");
  };

  const handleLoadSavedQuiz = (quiz, topic) => {
    setQuizData(quiz);
    setMode('quiz');
    setInputTopic(topic || "");
  };

  const handleLoadSavedSimulation = (simulation, topic) => {
    setSimulationData({ case: simulation });
    setMode('simulate');
    setInputTopic(topic || "");
  };

  return (
    <Card className="p-6 mb-4">
      <CardContent>
        <h2 className="text-2xl font-bold text-fuchsia-400 mb-4">
          🎓 LexTeacher - Simulation & Teaching Mode
        </h2>

        <div className="mb-4">
          <BrowseSavedItems
            onLoadLecture={handleLoadSavedLecture}
            onLoadQuiz={handleLoadSavedQuiz}
            onLoadSimulation={handleLoadSavedSimulation}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <label className="font-bold text-blue-300">
            🧠 Select Difficulty:
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="ml-2 px-2 py-1 rounded bg-gray-900 text-white border border-blue-700"
            >
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Difficult">Difficult</option>
            </select>
          </label>
          <input
            value={inputTopic}
            onChange={(e) => setInputTopic(e.target.value)}
            placeholder="Enter medical topic..."
            className="px-3 py-2 rounded bg-gray-900 text-white border border-fuchsia-700 flex-1"
            style={{ minWidth: 200 }}
          />
          <button onClick={fetchLecture} className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-5 py-2 rounded-xl font-bold transition">
            Get Lecture
          </button>
          <button onClick={fetchQuiz} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-xl font-bold transition">
            Get Quiz
          </button>
          <button onClick={fetchSimulation} className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-xl font-bold transition">
            Simulate Patient
          </button>
        </div>
        <div className="mb-4">
          <div className="bg-gray-900 rounded-xl p-4">
            <h4 className="text-blue-300 font-bold mb-1">📈 XP Tracker</h4>
            <p className="text-white">Level: {xpData.level}</p>
            <p className="text-white">XP: {xpData.xp}</p>
          </div>
        </div>
        {mode === 'lecture' && lectureText?.error && (
          <div className="text-red-400">⚠️ {lectureText.error}</div>
        )}
        {mode === 'lecture' && lectureText && !lectureText.error && <LectureOutputPanel lectureText={lectureText} />}
        {mode === 'quiz' && quizData && <QuizSelector quizData={quizData} />}
        {mode === 'simulate' && simulationData && <SimulationSelector simulationData={simulationData} />}
      </CardContent>
    </Card>
  );
}

export default TeachingPanel;
