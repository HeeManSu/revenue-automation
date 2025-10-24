import React from "react";
import { DocumentIcon, CheckCircleIcon } from "../assets/icons";

interface FullAuditMemoProps {
  memo: {
    metadata: {
      standard: string;
      contract_id: string;
      analysis_date: string;
      prepared_by: string;
      version: string;
    };
    purpose: {
      title: string;
      description: string;
    };
    contract_summary: {
      title: string;
      provider: string;
      customer: string;
      contract_id: string;
      effective_date: string;
      end_date: string;
      total_consideration: string;
      currency: string;
      description: string;
    };
    asc606_steps: {
      title: string;
      step1_contract: {
        title: string;
        description: string;
        criteria: string[];
      };
      step2_obligations: {
        title: string;
        description: string;
        obligations: Array<{
          name: string;
          type: string;
          recognition_method: string;
          ssp: number;
          allocated_value: number;
          recognition_trigger: string;
        }>;
      };
      step3_price: {
        title: string;
        description: string;
        total_price: string;
        variable_considerations: Array<{
          name: string;
          description: string;
        }>;
        discounts: Array<{
          name: string;
          description: string;
        }>;
      };
      step4_allocation: {
        title: string;
        description: string;
        allocations: Array<{
          obligation: string;
          ssp: number;
          allocated_amount: number;
          percentage: number;
        }>;
      };
      step5_recognition: {
        title: string;
        description: string;
        recognition_details: Array<{
          obligation: string;
          method: string;
          timing: string;
          trigger: string;
        }>;
      };
    };
    revenue_schedule: {
      title: string;
      description: string;
      total_entries: number;
      periods: Array<{
        period: string;
        total_amount: number;
        methods: string[];
        statuses: string[];
      }>;
      total_periods: number;
    };
    accounting_assessment: {
      title: string;
      compliance: {
        title: string;
        items: string[];
      };
      judgments: {
        title: string;
        items: string[];
      };
    };
    risk_assessment: {
      title: string;
      areas: Array<{
        area: string;
        level: string;
        mitigation: string;
      }>;
    };
    conclusion: {
      title: string;
      summary: string;
      total_revenue: string;
      recognition_period: string;
      memo_date: string;
      prepared_by: string;
      reviewed_by: string;
    };
  };
}

const AuditMemoDetailViewer: React.FC<FullAuditMemoProps> = ({ memo }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-6 mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <DocumentIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Audit Memorandum - Revenue Recognition Analysis
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                ASC 606 Compliant
              </span>
              <span className="text-sm text-gray-600">
                {memo.metadata.version}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500">Standard:</span>
            <p className="text-gray-900">{memo.metadata.standard}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Contract ID:</span>
            <p className="text-gray-900">{memo.metadata.contract_id}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Analysis Date:</span>
            <p className="text-gray-900">{memo.metadata.analysis_date}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Prepared By:</span>
            <p className="text-gray-900">{memo.metadata.prepared_by}</p>
          </div>
        </div>
      </div>

      {/* Purpose */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          1. {memo.purpose.title}
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {memo.purpose.description}
        </p>
      </section>

      {/* Contract Summary */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          2. {memo.contract_summary.title}
        </h2>
        <div className="bg-gray-50 rounded-lg p-6 mb-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-500">Provider:</span>
                <p className="text-gray-900">
                  {memo.contract_summary.provider}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Customer:</span>
                <p className="text-gray-900">
                  {memo.contract_summary.customer}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Contract ID:</span>
                <p className="text-gray-900">
                  {memo.contract_summary.contract_id}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-500">
                  Effective Date:
                </span>
                <p className="text-gray-900">
                  {memo.contract_summary.effective_date}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500">End Date:</span>
                <p className="text-gray-900">
                  {memo.contract_summary.end_date}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500">
                  Total Consideration:
                </span>
                <p className="text-gray-900 font-semibold">
                  {memo.contract_summary.total_consideration}
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-gray-700">{memo.contract_summary.description}</p>
      </section>

      {/* ASC 606 Steps */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          3. {memo.asc606_steps.title}
        </h2>

        {/* Step 1 */}
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            {memo.asc606_steps.step1_contract.title}
          </h3>
          <p className="text-gray-700 mb-3">
            {memo.asc606_steps.step1_contract.description}
          </p>
          <ul className="list-disc pl-6 space-y-1">
            {memo.asc606_steps.step1_contract.criteria.map(
              (criterion, index) => (
                <li key={index} className="text-gray-700">
                  {criterion}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            {memo.asc606_steps.step2_obligations.title}
          </h3>
          <p className="text-gray-700 mb-4">
            {memo.asc606_steps.step2_obligations.description}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    No.
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Performance Obligation
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Nature
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Recognition Method
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Distinct?
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {memo.asc606_steps.step2_obligations.obligations.map(
                  (obligation, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {obligation.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {obligation.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {obligation.recognition_method}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            {memo.asc606_steps.step3_price.title}
          </h3>
          <p className="text-gray-700 mb-4">
            {memo.asc606_steps.step3_price.description}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Variable Considerations:
              </h4>
              {memo.asc606_steps.step3_price.variable_considerations.length >
              0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {memo.asc606_steps.step3_price.variable_considerations.map(
                    (vc, index) => (
                      <li key={index} className="text-gray-700">
                        <strong>{vc.name}:</strong> {vc.description}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-gray-500">None identified</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Discounts and Incentives:
              </h4>
              {memo.asc606_steps.step3_price.discounts.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {memo.asc606_steps.step3_price.discounts.map(
                    (discount, index) => (
                      <li key={index} className="text-gray-700">
                        <strong>{discount.name}:</strong> {discount.description}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-gray-500">None identified</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            {memo.asc606_steps.step4_allocation.title}
          </h3>
          <p className="text-gray-700 mb-4">
            {memo.asc606_steps.step4_allocation.description}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Obligation
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    SSP
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Allocated Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {memo.asc606_steps.step4_allocation.allocations.map(
                  (allocation, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {allocation.obligation}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(allocation.ssp)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(allocation.allocated_amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {allocation.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 5 */}
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            {memo.asc606_steps.step5_recognition.title}
          </h3>
          <p className="text-gray-700 mb-4">
            {memo.asc606_steps.step5_recognition.description}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Obligation
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Recognition Timing
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Trigger
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {memo.asc606_steps.step5_recognition.recognition_details.map(
                  (detail, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {detail.obligation}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {detail.method}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {detail.timing}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {detail.trigger}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Revenue Schedule */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          4. {memo.revenue_schedule.title}
        </h2>
        <p className="text-gray-700 mb-4">
          {memo.revenue_schedule.description}
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Obligation(s)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {memo.revenue_schedule.periods.map((period, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {period.period}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">Multiple</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatCurrency(period.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {period.methods.join(", ")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {period.statuses.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {memo.revenue_schedule.total_periods > 10 && (
          <p className="mt-2 text-gray-600 text-sm">
            Showing 10 of {memo.revenue_schedule.total_periods} total periods
          </p>
        )}
      </section>

      {/* Accounting Assessment */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          5. {memo.accounting_assessment.title}
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {memo.accounting_assessment.compliance.title}
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              {memo.accounting_assessment.compliance.items.map(
                (item, index) => (
                  <li key={index} className="text-gray-700">
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {memo.accounting_assessment.judgments.title}
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              {memo.accounting_assessment.judgments.items.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Risk Assessment */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          6. {memo.risk_assessment.title}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Risk Area
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Assessment
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Mitigation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {memo.risk_assessment.areas.map((risk, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {risk.area}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded ${
                        risk.level === "High"
                          ? "bg-red-100 text-red-800"
                          : risk.level === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {risk.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {risk.mitigation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Conclusion */}
      <section className="mb-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          7. {memo.conclusion.title}
        </h2>
        <p className="text-gray-700 mb-6">{memo.conclusion.summary}</p>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <span className="font-medium text-gray-500">
              Total Revenue Recognized:
            </span>
            <p className="text-gray-900 font-semibold">
              {memo.conclusion.total_revenue}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-500">
              Recognition Period:
            </span>
            <p className="text-gray-900">
              {memo.conclusion.recognition_period}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Prepared On:</span>
            <p className="text-gray-900">{memo.conclusion.memo_date}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 text-sm text-gray-600">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Prepared by:</span>
            <p>{memo.conclusion.prepared_by}</p>
          </div>
          <div>
            <span className="font-medium">Reviewed by:</span>
            <p>{memo.conclusion.reviewed_by}</p>
          </div>
          <div>
            <span className="font-medium">Version:</span>
            <p>{memo.metadata.version}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditMemoDetailViewer;
