/**
 * i18n.js — 多语言支持
 */

const i18n = {
  lang: localStorage.getItem('lang') || 'zh-Hans',

  messages: {
    'zh-Hans': {
      'dashboard': '仪表盘',
      'leaderboard': '排行榜',
      'coaching': 'GROW教练建议',
      'challenges': '挑战进度',
      'goal': '目标 (Goal)',
      'reality': '现状 (Reality)',
      'options': '选项 (Options)',
      'wayForward': '行动 (Way Forward)',
      'weeklyRank': '周排行',
      'monthlyRank': '月排行',
      'coachingQuestions': '本周重点问题',
      'overallScore': '总分',
      'level': '等级',
      'points': '积分',
      'calls': '通话数',
      'badges': '徽章',
      'rank': '排名',
      'user': '用户',
      'avgScore': '平均分',
      'noData': '暂无数据',
      'loading': '加载中...',
      'error': '出错',
      'loadData': '加载数据',
      'inputUserId': '输入用户ID',
      'tenDimensions': '十维度评估',
      'dimensionDetails': '维度详情'
    },
    'zh-Hant': {
      'dashboard': '儀表板',
      'leaderboard': '排行榜',
      'coaching': 'GROW教練建議',
      'challenges': '挑戰進度',
      'goal': '目標 (Goal)',
      'reality': '現狀 (Reality)',
      'options': '選項 (Options)',
      'wayForward': '行動 (Way Forward)',
      'weeklyRank': '週排行',
      'monthlyRank': '月排行',
      'coachingQuestions': '本週重點問題',
      'overallScore': '總分',
      'level': '等級',
      'points': '積分',
      'calls': '通話數',
      'badges': '徽章',
      'rank': '排名',
      'user': '用戶',
      'avgScore': '平均分',
      'noData': '暫無數據',
      'loading': '載入中...',
      'error': '出錯',
      'loadData': '載入數據',
      'inputUserId': '輸入用戶ID',
      'tenDimensions': '十維度評估',
      'dimensionDetails': '維度詳情'
    },
    'en': {
      'dashboard': 'Dashboard',
      'leaderboard': 'Leaderboard',
      'coaching': 'GROW Coaching Suggestions',
      'challenges': 'Challenge Progress',
      'goal': 'Goal Setting',
      'reality': 'Reality Check',
      'options': 'Options',
      'wayForward': 'Way Forward',
      'weeklyRank': 'Weekly Ranking',
      'monthlyRank': 'Monthly Ranking',
      'coachingQuestions': 'This Week\'s Key Questions',
      'overallScore': 'Overall Score',
      'level': 'Level',
      'points': 'Points',
      'calls': 'Call Count',
      'badges': 'Badges',
      'rank': 'Rank',
      'user': 'User',
      'avgScore': 'Avg Score',
      'noData': 'No data',
      'loading': 'Loading...',
      'error': 'Error',
      'loadData': 'Load Data',
      'inputUserId': 'Enter User ID',
      'tenDimensions': 'Ten Dimensions Assessment',
      'dimensionDetails': 'Dimension Details'
    },
    'ja': {
      'dashboard': 'ダッシュボード',
      'leaderboard': 'ランキング',
      'coaching': 'GROW コーチング提案',
      'challenges': 'チャレンジ進行状況',
      'goal': '目標設定',
      'reality': '現状確認',
      'options': 'オプション',
      'wayForward': '行動計画',
      'weeklyRank': '週間ランキング',
      'monthlyRank': '月間ランキング',
      'coachingQuestions': '今週のキーとなる質問',
      'overallScore': '総合スコア',
      'level': 'レベル',
      'points': 'ポイント',
      'calls': 'コール数',
      'badges': 'バッジ',
      'rank': 'ランク',
      'user': 'ユーザー',
      'avgScore': '平均スコア',
      'noData': 'データなし',
      'loading': '読み込み中...',
      'error': 'エラー',
      'loadData': 'データを読み込む',
      'inputUserId': 'ユーザーIDを入力',
      'tenDimensions': '10次元評価',
      'dimensionDetails': '次元の詳細'
    },
    'fr': {
      'dashboard': 'Tableau de bord',
      'leaderboard': 'Classement',
      'coaching': 'Suggestions de coaching GROW',
      'challenges': 'Progression des défis',
      'goal': 'Définition des objectifs',
      'reality': 'Vérification de la réalité',
      'options': 'Options',
      'wayForward': 'Plan d\'action',
      'weeklyRank': 'Classement hebdomadaire',
      'monthlyRank': 'Classement mensuel',
      'coachingQuestions': 'Questions clés de cette semaine',
      'overallScore': 'Score global',
      'level': 'Niveau',
      'points': 'Points',
      'calls': 'Nombre d\'appels',
      'badges': 'Badges',
      'rank': 'Classement',
      'user': 'Utilisateur',
      'avgScore': 'Score moyen',
      'noData': 'Pas de données',
      'loading': 'Chargement...',
      'error': 'Erreur',
      'loadData': 'Charger les données',
      'inputUserId': 'Entrez l\'ID utilisateur',
      'tenDimensions': 'Évaluation décennale',
      'dimensionDetails': 'Détails de la dimension'
    }
  },

  t(key) {
    return this.messages[this.lang]?.[key] || key;
  },

  setLang(lang) {
    this.lang = lang;
    localStorage.setItem('lang', lang);
    this.updatePageLanguage();
  },

  updatePageLanguage() {
    document.documentElement.lang = this.lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = this.t(el.dataset.i18n);
    });
  }
};

// 初始化页面语言
document.addEventListener('DOMContentLoaded', () => {
  i18n.updatePageLanguage();
});
