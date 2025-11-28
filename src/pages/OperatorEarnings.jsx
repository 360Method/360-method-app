import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auth, Operator, functions } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, Download, ArrowLeft } from 'lucide-react';

export default function OperatorEarnings() {
  const [operatorId, setOperatorId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me()
  });

  const { data: operators = [] } = useQuery({
    queryKey: ['myOperators'],
    queryFn: () => Operator.filter({ created_by: user?.email }),
    enabled: !!user
  });

  React.useEffect(() => {
    if (operators.length > 0 && !operatorId) {
      setOperatorId(operators[0].id);
    }
  }, [operators]);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['operatorTransactions', operatorId],
    queryFn: async () => {
      const { data } = await functions.invoke('getOperatorTransactionHistory', {
        operator_id: operatorId
      });
      return data.transactions || [];
    },
    enabled: !!operatorId
  });

  const succeededTransactions = transactions.filter(t => t.status === 'succeeded');
  const totalEarnings = succeededTransactions.reduce((sum, t) => sum + (t.amount_operator / 100), 0);
  const totalFees = succeededTransactions.reduce((sum, t) => sum + (t.amount_platform_fee / 100), 0);
  const transactionCount = succeededTransactions.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings Dashboard</h1>
          <p className="text-gray-600">Track your payments and revenue</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 rounded-full p-2">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Total Earnings</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${totalEarnings.toFixed(2)}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 rounded-full p-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Platform Fees</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${totalFees.toFixed(2)}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 rounded-full p-2">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Transactions</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {transactionCount}
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-600">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {succeededTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.created_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      ${(transaction.amount_operator / 100).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Fee: ${(transaction.amount_platform_fee / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}