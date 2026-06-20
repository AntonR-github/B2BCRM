// Grid editor for the compare table — products as columns, features as rows

const NUM_PRODS = 4
const NUM_FEATS = 6

interface Field { key: string; value: string }

function cell(fields: Field[], key: string) {
  return fields.find(f => f.key === key)?.value ?? ''
}

export function CompareGridEditor({ fields }: { fields: Field[] }) {
  const v = (key: string) => cell(fields, key)

  const inputClass =
    'w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500 text-center'
  const labelInputClass =
    'w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500 text-right'

  return (
    <div>
      <p className="text-slate-500 text-sm uppercase tracking-widest mb-4">Comparison Table</p>

      <div className="overflow-x-auto w-1/2">
        <table className="w-full border-collapse" dir="rtl">
          <thead>
            <tr>
              <th className="w-44 pb-3" />
              {Array.from({ length: NUM_PRODS }, (_, pi) => (
                <th key={pi} className="pb-3 px-2 min-w-[180px]">
                  <div className="text-slate-400 text-xs uppercase tracking-wide mb-2 text-center">
                    Product {pi + 1}
                  </div>
                  <input
                    name={`compare.prod${pi + 1}_name`}
                    defaultValue={v(`compare.prod${pi + 1}_name`)}
                    placeholder="Name"
                    className={inputClass + ' font-semibold'}
                  />
                </th>
              ))}
            </tr>
            <tr>
              <td className="pb-3" />
              {Array.from({ length: NUM_PRODS }, (_, pi) => (
                <td key={pi} className="pb-3 px-2">
                  <input
                    name={`compare.prod${pi + 1}_price`}
                    defaultValue={v(`compare.prod${pi + 1}_price`)}
                    placeholder="299"
                    className={inputClass}
                  />
                </td>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={NUM_PRODS + 1} className="py-1">
                <div className="border-t border-slate-700" />
              </td>
            </tr>

            {Array.from({ length: NUM_FEATS }, (_, fi) => (
              <tr key={fi} className="border-t border-slate-800/60">
                <td className="py-2 pr-3">
                  <input
                    name={`compare.feat${fi + 1}_label`}
                    defaultValue={v(`compare.feat${fi + 1}_label`)}
                    placeholder={`Feature ${fi + 1}`}
                    className={labelInputClass}
                  />
                </td>
                {Array.from({ length: NUM_PRODS }, (_, pi) => (
                  <td key={pi} className="py-2 px-2">
                    <input
                      name={`compare.prod${pi + 1}_feat${fi + 1}`}
                      defaultValue={v(`compare.prod${pi + 1}_feat${fi + 1}`)}
                      className={inputClass}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
