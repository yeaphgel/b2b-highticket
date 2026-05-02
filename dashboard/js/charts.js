/**
 * charts.js — 图表渲染模块
 */

let radarChart = null;

const Charts = {
  // 十维度标签
  dimensionLabels: [
    '破冰',
    '识别需求',
    '传达价值',
    '建立信任',
    '信任塑造',
    '定制解决',
    '异议处理',
    '促成交易',
    '关系维护',
    '钩子'
  ],

  // 创建雷达图
  createRadarChart(canvas, dimensionScores) {
    const ctx = canvas.getContext('2d');

    const data = {
      labels: this.dimensionLabels,
      datasets: [
        {
          label: '你的表现',
          data: this.dimensionLabels.map(name => {
            const dim = Object.keys(dimensionScores).find(key =>
              this.dimensionLabels[Object.keys(dimensionScores).indexOf(key)] === name
            );
            return dimensionScores[Object.keys(dimensionScores).find(k =>
              this.dimensionLabels.find(l => l === name)
            )] || 0;
          }),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 2,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: '目标水平 (8分)',
          data: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
          borderColor: '#51cf66',
          backgroundColor: 'rgba(81, 207, 102, 0.05)',
          borderWidth: 1,
          borderDash: [5, 5],
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 0
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 10,
          ticks: {
            stepSize: 2,
            color: '#999'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          pointLabels: {
            font: {
              size: 12,
              weight: '500'
            },
            color: '#333'
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 12
          },
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.r.toFixed(1)} 分`;
            }
          }
        }
      }
    };

    // 销毁旧图表
    if (radarChart) {
      radarChart.destroy();
    }

    radarChart = new Chart(ctx, {
      type: 'radar',
      data,
      options
    });
  },

  // 渲染维度列表
  renderDimensionList(container, dimensionScores) {
    const dimensions = [
      { key: 'ice_breaking', name: '破冰' },
      { key: 'identify_needs', name: '识别需求' },
      { key: 'deliver_value', name: '传达价值' },
      { key: 'build_trust', name: '建立信任' },
      { key: 'trust_shaping', name: '信任塑造' },
      { key: 'custom_solutions', name: '定制解决' },
      { key: 'objection_handling', name: '异议处理' },
      { key: 'close_deal', name: '促成交易' },
      { key: 'relationship_maintenance', name: '关系维护' },
      { key: 'hooks', name: '钩子' }
    ];

    const html = dimensions.map(dim => {
      const score = dimensionScores[dim.key] || 0;
      const percentage = (score / 10) * 100;
      const color = score >= 8 ? '#51cf66' : score >= 6 ? '#4169e1' : score >= 4 ? '#ffc107' : '#ff6b6b';

      return `
        <div class="dimension-item">
          <span class="dimension-name">${dim.name}</span>
          <div style="display: flex; gap: 10px; align-items: center;">
            <div style="width: 100px; height: 6px; background: #eee; border-radius: 3px; overflow: hidden;">
              <div style="width: ${percentage}%; height: 100%; background: ${color}; transition: width 0.3s;"></div>
            </div>
            <span class="dimension-score">${score.toFixed(1)}</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  },

  // 创建排行榜表
  renderLeaderboard(container, rankings) {
    if (!rankings || rankings.length === 0) {
      container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">暂无排行数据</td></tr>';
      return;
    }

    const html = rankings.map((item, idx) => {
      let badgeClass = 'rank-default';
      if (item.rank === 1) badgeClass = 'rank-1';
      else if (item.rank === 2) badgeClass = 'rank-2';
      else if (item.rank === 3) badgeClass = 'rank-3';

      return `
        <tr>
          <td>
            <span class="rank-badge ${badgeClass}">
              ${item.rank}${item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : ''}
            </span>
          </td>
          <td>${item.userId}</td>
          <td>${item.levelName}</td>
          <td>${item.avgScore?.toFixed(1) || '0'}</td>
          <td><strong>${item.points}</strong></td>
        </tr>
      `;
    }).join('');

    container.innerHTML = html;
  },

  // 渲染GROW建议
  renderGrowCoaching(growData) {
    if (!growData) return;

    // 目标
    const goalHtml = `
      <div class="grow-content">
        <p><strong>${growData.goal?.weeklyTarget || ''}</strong></p>
        <ul>
          <li>预期改进: ${growData.goal?.expectedImprovement || ''}</li>
          <li>关键焦点: ${growData.goal?.keyFocus?.join('、') || ''}</li>
          <li>理由: ${growData.goal?.rationale || ''}</li>
        </ul>
      </div>
    `;
    document.getElementById('goalContent').innerHTML = goalHtml;

    // 现状
    const realityHtml = `
      <div class="grow-content">
        <p><strong>整体分数: ${growData.reality?.overallScore || 0} / 10</strong></p>
        <ul>
          <li><strong>优势:</strong> ${growData.reality?.strengths?.join('、') || '无'}</li>
          <li><strong>挑战:</strong> ${growData.reality?.challenges?.join('、') || '无'}</li>
          <li><strong>趋势:</strong> ${growData.reality?.trend || ''}</li>
          <li><strong>最近复盘:</strong> ${growData.reality?.lastReviewDate || '暂无'}</li>
        </ul>
      </div>
    `;
    document.getElementById('realityContent').innerHTML = realityHtml;

    // 选项
    const optionsHtml = `
      <div class="grow-content">
        ${growData.options?.topImprovementAreas?.map(opt => `
          <div style="margin-bottom: 15px;">
            <p><strong>${opt.priority}. ${opt.dimension}</strong> (当前: ${opt.currentScore}分 → 目标: ${opt.targetScore}分)</p>
            <ul>
              ${opt.actionPlan?.map(a => `<li>${a}</li>`).join('') || ''}
            </ul>
            <p style="font-size: 12px; color: #666;">
              学习资源: ${opt.learningResources?.join(' | ') || ''}
            </p>
          </div>
        `).join('') || ''}
      </div>
    `;
    document.getElementById('optionsContent').innerHTML = optionsHtml;

    // 行动计划
    const wayForwardHtml = `
      <div class="grow-content">
        <p><strong>本周行动计划:</strong></p>
        <ul>
          <li>${growData.wayForward?.weekAction?.monday || ''}</li>
          <li>${growData.wayForward?.weekAction?.wednesday || ''}</li>
          <li>${growData.wayForward?.weekAction?.friday || ''}</li>
        </ul>
        <p><strong>月度里程碑:</strong> ${growData.wayForward?.monthlyMilestone || ''}</p>
        <p><strong>关键成功指标:</strong></p>
        <ul>
          ${growData.wayForward?.keySuccess?.map(k => `<li>✓ ${k}</li>`).join('') || ''}
        </ul>
        <p><strong>下次复盘:</strong> ${growData.wayForward?.nextReview || ''}</p>
      </div>
    `;
    document.getElementById('wayForwardContent').innerHTML = wayForwardHtml;
  },

  // 渲染教练问题
  renderCoachingQuestions(questions) {
    if (!questions || questions.length === 0) return;

    const html = questions.map((q, idx) => `
      <div class="question-item">
        <span class="question-number">${idx + 1}</span>
        ${q}
      </div>
    `).join('');

    document.getElementById('coachingQuestions').innerHTML = html;
  },

  // 渲染挑战列表
  renderChallenges(challenges) {
    if (!challenges || challenges.length === 0) {
      document.getElementById('challengesList').innerHTML = '<p style="text-align: center; color: #999;">暂无挑战进度</p>';
      return;
    }

    const html = challenges.map(c => {
      const progress = Math.min(100, Math.floor((c.completed || 0) / (c.total || 1) * 100));
      return `
        <div class="challenge-item">
          <div class="challenge-name">🎯 ${c.name || '未命名'}</div>
          <div class="challenge-progress">${c.completed || 0}/${c.total || 0} 完成</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('challengesList').innerHTML = html;
  }
};
