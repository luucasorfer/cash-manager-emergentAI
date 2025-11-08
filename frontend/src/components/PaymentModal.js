import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, Banknote, Wallet } from 'lucide-react';

const PaymentModal = ({ open, onClose, onConfirm, expenseName }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit');

  const paymentMethods = [
    { value: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
    { value: 'debit', label: 'Cartão de Débito', icon: CreditCard },
    { value: 'pix', label: 'PIX', icon: Smartphone },
    { value: 'cash', label: 'Dinheiro', icon: Banknote },
  ];

  const handleConfirm = () => {
    onConfirm(paymentMethod);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="payment-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Marcar como Pago</DialogTitle>
          <p className="text-sm text-slate-600 mt-2">
            {expenseName}
          </p>
        </DialogHeader>

        <div className="py-4">
          <Label className="text-base font-medium mb-3 block">Forma de Pagamento</Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.value}
                    className={`
                      flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer
                      transition-all duration-200
                      ${paymentMethod === method.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                      }
                    `}
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <RadioGroupItem value={method.value} id={method.value} />
                    <Icon size={20} className={paymentMethod === method.value ? 'text-emerald-600' : 'text-slate-600'} />
                    <Label
                      htmlFor={method.value}
                      className="flex-1 cursor-pointer font-medium"
                    >
                      {method.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="cancel-payment-btn"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-emerald-500 hover:bg-emerald-600"
            data-testid="confirm-payment-btn"
          >
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
