import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sourceCode: `// Enter your code here
function greet(name) {
    console.log("Hello, " + name + "!");
}

greet("World");`,
  outputCode: '',
  sourceLang: 'javascript',
  targetLang: 'python',
  operationMode: 'convert', // 'convert', 'optimize', 'debug', 'explain'
  theme: 'vs-dark', // 'vs-dark' | 'light'
  isLoading: false,
  resultType: 'code', // 'code' | 'markdown'
  report: ''
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setSourceCode: (state, action) => {
      state.sourceCode = action.payload;
    },
    setOutputCode: (state, action) => {
      state.outputCode = action.payload;
      state.resultType = 'code';
      state.report = '';
    },
    setSourceLang: (state, action) => {
      state.sourceLang = action.payload;
    },
    setTargetLang: (state, action) => {
      state.targetLang = action.payload;
    },
    setOperationMode: (state, action) => {
      state.operationMode = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setEditorLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setReport: (state, action) => {
      state.report = action.payload;
      state.resultType = 'markdown';
      state.outputCode = '';
    },
    setResultType: (state, action) => {
      state.resultType = action.payload;
    },
    clearEditor: (state) => {
      state.sourceCode = '';
      state.outputCode = '';
      state.report = '';
      state.resultType = 'code';
    }
  }
});

export const {
  setSourceCode,
  setOutputCode,
  setSourceLang,
  setTargetLang,
  setOperationMode,
  setTheme,
  setEditorLoading,
  setReport,
  setResultType,
  clearEditor
} = editorSlice.actions;

export default editorSlice.reducer;
