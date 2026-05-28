import { STEPS } from "@/constants";

export function Steps() {
  return (
    <section id="steps" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground">
            4步让AI主动推荐你
          </h2>
          <p className="mt-4 text-muted">
            从填写信息到被AI引用，全程自动化
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <div key={step.step} className="relative text-center">
              {index < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
              )}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-xl font-bold mb-4 relative z-10">
                {step.step}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
