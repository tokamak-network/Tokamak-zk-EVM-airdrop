import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
}) => {
  return (
    <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="text-4xl mb-4">{icon}</div>
      <div className="text-lg font-semibold text-gray-900 mb-1">{title}</div>
      <div className="text-3xl font-bold text-tokamak-600 mb-2">{value}</div>
      <div className="text-sm text-gray-700">{description}</div>
    </div>
  );
};

const Stats: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="총 에어드랍 풀"
            value="10M"
            description="TON 토큰"
            icon="🎁"
          />
          <StatCard
            title="참여자 수"
            value="25K+"
            description="활성 사용자"
            icon="👥"
          />
          <StatCard
            title="평균 보상"
            value="400"
            description="TON 토큰"
            icon="💰"
          />
          <StatCard
            title="남은 시간"
            value="15일"
            description="마감까지"
            icon="⏰"
          />
        </div>
      </div>
    </section>
  );
};

export default Stats;
