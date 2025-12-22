/**
 * GA-Life 시뮬레이션의 핵심 동작을 제어하는 파라미터 타입
 */
export type SimParams = {
  /** 확률 곡선의 전체 높이 (전체 생존/탄생률) */
  alpha: number;
  /** 확률 곡선의 민감도 (기울기) */
  beta: number;
  /** 확률 곡선 우측의 감쇠 정도 */
  gamma: number;
  /** 생존 확률이 최대가 되는 최적 영향력 값 */
  mu: number;
  /** 탄생 확률이 최대가 되는 최적 영향력 값 */
  nu: number;
  /** 전체 확률에 더해지는 기본 상수 (기본 생존/탄생 기회) */
  delta: number;
  /** 이 값보다 작은 확률은 0으로 처리 (연산 최적화) */
  epsilon: number;
  /** 자손의 형태 유전자에 변이가 일어날 확률 */
  p_mut: number;
};
